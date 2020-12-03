import { TEpic } from '@redux/RootEpic'
import { permissionAction } from '@redux/slices/permission.slice'
import { onError } from '@util/onError.util'
import { Alert } from 'react-native'
import { Permission, PermissionStatus, RESULTS, checkMultiple, requestMultiple } from 'react-native-permissions'
import { AnyAction } from 'redux'
import { concatAll, filter, ignoreElements, map, switchMap, tap } from 'rxjs/operators'

const e: TEpic[] = []

e[e.length] = (action$, state$) =>
  action$.pipe(
    filter(permissionAction.check.match),
    switchMap(({ payload }) => checkMultiple(payload)),
    map(onPermissionMultiple),
    map(({ denied, granted, blocked }) => {
      const actions: AnyAction[] = []

      if (granted.length) {
        actions.push(permissionAction.granted(granted))
      }

      if (denied.length) {
        actions.push(permissionAction.denied(denied))
      }

      if (blocked.length) {
        actions.push(permissionAction.blocked(blocked))
      }

      return actions
    }),
    concatAll(),
    onError(state$),
  )

e[e.length] = (action$, state$) =>
  action$.pipe(
    filter(permissionAction.request.match),
    switchMap(({ payload }) => requestMultiple(payload)),
    map(onPermissionMultiple),
    map(permissionAction.onRequested),
    onError(state$),
  )

e[e.length] = (action$, state$) =>
  action$.pipe(
    filter(permissionAction.denied.match),
    map(({ payload }) => permissionAction.request(payload)),
    onError(state$),
  )

e[e.length] = (action$, state$) =>
  action$.pipe(
    filter(permissionAction.blocked.match),
    tap(({ payload }) => Alert.alert('Permission Blocked', payload.join(', '))),
    ignoreElements(),
    onError(state$),
  )

export const permissionEpics = e

function onPermissionMultiple(status: Record<Permission, PermissionStatus>) {
  const denied: Permission[] = []
  const granted: Permission[] = []
  const blocked: Permission[] = []

  Object.keys(status)
    .map((k) => k as Permission)
    .forEach((key) => {
      switch (status[key]) {
        case RESULTS.DENIED:
          denied.push(key)
          break
        case RESULTS.BLOCKED:
          blocked.push(key)
          break
        case RESULTS.GRANTED:
          granted.push(key)
          break
        case RESULTS.UNAVAILABLE:
          // looks like there is a bug here on iOS -> Photo-Library is enabled by default on some versions
          // so it will show unavailable here; maybe others too
          console.log(`${key} permission is unavailable`)
          // treat unavailable as granted
          granted.push(key)
          break
      }
    })

  return { denied, granted, blocked }
}
