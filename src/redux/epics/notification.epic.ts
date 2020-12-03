import { TEpic } from '@redux/RootEpic'
import { errorActions } from '@redux/slices/error.slice'
import { TNotificationContent, notificationActions } from '@redux/slices/notification.slice'
import { onError } from '@util/onError.util'
import { Analytics } from 'aws-amplify'
import { Notification, Notifications, Registered, RegistrationError } from 'react-native-notifications'
import { AnyAction } from 'redux'
import { Observable, from } from 'rxjs'
import { catchError, concatAll, filter, map, switchMap } from 'rxjs/operators'

import { appLifecycleActions } from '../slices/appLifecycle.slice'

const e: TEpic[] = []

e[e.length] = (action$, _state$) =>
  action$.pipe(
    filter(appLifecycleActions.appLaunched.match),
    switchMap(async (_action) => {
      const hasPermission = await Notifications.isRegisteredForRemoteNotifications()
      Notifications.android.setNotificationChannel({
        channelId: 'inapp',
        importance: 3,
        name: 'In App Activity',
      })
      return [notificationActions.isRegisteredForRemoteNotifications(hasPermission)]
    }),
    concatAll(),
  )

e[e.length] = (action$, state$) =>
  action$.pipe(
    filter(notificationActions.register.match),
    switchMap(async (_action) => {
      Notifications.registerRemoteNotifications()
      const token = await didRegister()
      if (!token) {
        return [notificationActions.isRegisteredForRemoteNotifications(false)]
      }
      console.log('Device Token Received', token)
      Notifications.setNotificationChannel({
        name: 'lookback',
        channelId: 'lookback',
        importance: 2,
      })

      const userId = state$.value.user.sub
      await Analytics.updateEndpoint({
        userId,
        address: token,
      })

      Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
        console.error(event)
      })
      return [notificationActions.isRegisteredForRemoteNotifications(true)]
    }),
    concatAll(),
    onError(state$),
  )

e[e.length] = (_action$, _store, _service) =>
  pushNotification().pipe(
    map((notification) => {
      console.log('RECEIVED NOTIFICATION IN ACTION: ', notification)
      if (notification !== undefined) {
        return [notificationActions.receivedNotification(notification)]
      }
      return []
    }),
    concatAll(),
    catchError(handlePushNotificationError),
  )

export const notificationEpics = e

type GoogleChatNotificationPayload = {
  'gcm.notification.body': string
  'gcm.notification.title': string
}

const didRegister = () =>
  new Promise<string>((resolve, reject) => {
    Notifications.events().registerRemoteNotificationsRegistered((event: Registered) => {
      if (event.deviceToken) {
        return resolve(event.deviceToken)
      }
      reject('Error registering push token')
    })
  })

function convertGcmNotification(notification: Notification): TNotificationContent {
  Notifications.removeAllDeliveredNotifications()
  const identifier = notification.identifier
  const payload = notification.payload as GoogleChatNotificationPayload
  return {
    title: payload['gcm.notification.title'],
    body: payload['gcm.notification.body'],
    identifier,
  }
}

const pushNotification = (): Observable<TNotificationContent> => {
  return new Observable<TNotificationContent>((subscriber) => {
    Notifications.events().registerNotificationReceivedForeground((notification: Notification) => {
      console.log(`Notification received in foreground: ${notification.title} : ${notification.body}`)
      subscriber.next(convertGcmNotification(notification))
    })

    Notifications.events().registerNotificationReceivedBackground((notification: Notification) => {
      console.log(`Notification received in background: ${notification.title} : ${notification.body}`)
      subscriber.next(convertGcmNotification(notification))
    })
  })
}

function handlePushNotificationError(err: Error | any, _source: Observable<AnyAction>): Observable<AnyAction> {
  console.log(err)
  return from([errorActions.error(err)])
}
