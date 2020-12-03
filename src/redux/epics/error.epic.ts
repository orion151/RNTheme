import { TEpic } from '@redux/RootEpic'
import { appLifecycleActions } from '@redux/slices/appLifecycle.slice'
import { errorActions } from '@redux/slices/error.slice'
import { onError } from '@util/onError.util'
import { Alert } from 'react-native'
import { filter, mapTo, tap } from 'rxjs/operators'

const e: TEpic[] = []

e[e.length] = (action$, state$) =>
  action$.pipe(
    filter(errorActions.showAlert.match),
    tap(({ payload: { message } }) => showAlert(message)),
    mapTo(errorActions.doNothing()),
    onError(state$),
  )

// Stop loading on any error
e[e.length] = (action$, state$) =>
  action$.pipe(filter(errorActions.error.match), mapTo(appLifecycleActions.stopAllLoading()), onError(state$))

export const errorEpics = e

const showAlert = (message: string, title = 'Error') =>
  Alert.alert(title, message, [{ text: 'Dismiss', style: 'cancel' }])
