import { lastReadTimeReducer } from '@slices/lastReadTimes.slice'
import { combineReducers } from 'redux'

import { appLifecycleReducer } from './slices/appLifecycle.slice'
import { authReducer } from './slices/auth.slice'
import { commentsReducer } from './slices/comments.slice'
import { contactsReducer } from './slices/contacts.slice'
import { errorReducer } from './slices/error.slice'
import { iapReducer } from './slices/iap.slice'
import { memoriesReducer } from './slices/memories.slice'
import { notificationReducer } from './slices/notification.slice'
import { peopleReducer } from './slices/people.slice'
import { permissionReducer } from './slices/permission.slice'
import { templateReducer } from './slices/template.slice'
import { userReducer } from './slices/user.slice'

// MARKER_REDUCERS_IMPORT

const rootReducer = combineReducers({
  appLifecycle: appLifecycleReducer,
  auth: authReducer,
  comments: commentsReducer,
  contacts: contactsReducer,
  error: errorReducer,
  iap: iapReducer,
  lastReadTimes: lastReadTimeReducer,
  memories: memoriesReducer,
  notification: notificationReducer,
  people: peopleReducer,
  permission: permissionReducer,
  template: templateReducer,
  user: userReducer,
  // MARKER_REDUCERS_LIST
})

export { rootReducer }
