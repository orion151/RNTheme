import { appLifecycleEpics } from '@epics/appLifecycle.epic'
import { authEpics } from '@epics/auth.epic'
import { commentsEpics } from '@epics/comments.epic'
import { contactEpics } from '@epics/contact.epic'
import { errorEpics } from '@epics/error.epic'
import { lastReadTimeEpics } from '@epics/lastReadTimes.epic'
import { notificationEpics } from '@epics/notification.epic'
import { permissionEpics } from '@epics/permission.epic'
import { userEpics } from '@epics/user.epic'
import { AnyAction } from 'redux'
import { Epic, combineEpics } from 'redux-observable'

import { AppServices } from './AppServices'
import { AppState } from './AppState'
import { iapEpics } from './epics/iap.epic'
import { memoriesEpics } from './epics/memories.epic'
import { peopleEpics } from './epics/people.epic'

// MARKER_IMPORTS_INSERTION_POINT

export const RootEpic = combineEpics(
  ...appLifecycleEpics,
  ...authEpics,
  ...commentsEpics,
  ...contactEpics,
  ...iapEpics,
  ...errorEpics,
  ...memoriesEpics,
  ...notificationEpics,
  ...peopleEpics,
  ...permissionEpics,
  ...userEpics,
  ...lastReadTimeEpics,
  // MARKER_EPIC_INSERTION_POINT
)

export type TEpic = Epic<AnyAction, AnyAction, AppState, AppServices>
