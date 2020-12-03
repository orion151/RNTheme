import { appLifecycleActions } from '@redux/slices/appLifecycle.slice'
import { authActions } from '@redux/slices/auth.slice'
import { commentsActions } from '@redux/slices/comments.slice'
import { contactsActions } from '@redux/slices/contacts.slice'
import { memoriesActions } from '@redux/slices/memories.slice'
import { notificationActions } from '@redux/slices/notification.slice'
import { permissionAction } from '@redux/slices/permission.slice'
import { userActions } from '@redux/slices/user.slice'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { iapActions } from '../redux/slices/iap.slice'
import { peopleActions } from '../redux/slices/people.slice'
import { templateActions } from '../redux/slices/template.slice'

/*
 * ** Usage **
 * const useAction = makeHook(authActions)
 * const action = useAction('confirmSignUp')
 */
function makeActionHook<T>(actions: T) {
  return <A extends keyof T>(action: A, isNull = false): T[A] => {
    const dispatch = useDispatch()
    const act = actions[action] as any
    const callback = isNull ? () => dispatch(act()) : (payload: any) => dispatch(act(payload))
    return useCallback(callback, []) as any
  }
}

export const useAuthAction = makeActionHook(authActions)
export const useCommentsAction = makeActionHook(commentsActions)
export const useContactsAction = makeActionHook(contactsActions)
export const useIapAction = makeActionHook(iapActions)
export const useLifecycleAction = makeActionHook(appLifecycleActions)
export const useMemoriesAction = makeActionHook(memoriesActions)
export const useNotificationAction = makeActionHook(notificationActions)
export const usePeopleAction = makeActionHook(peopleActions)
export const usePermissionAction = makeActionHook(permissionAction)
export const useTemplateAction = makeActionHook(templateActions)
export const useUserAction = makeActionHook(userActions)
