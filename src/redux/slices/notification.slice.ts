import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { authActions } from './auth.slice'

export type TNotificationContent = {
  identifier?: string
  title: string
  body: string
}

type State = {
  pending: TNotificationContent[]
  hasPermission: boolean | 'dontknow'
}

const INITIAL_STATE: State = {
  pending: [],
  hasPermission: 'dontknow',
}

const notificationSlice = createSlice({
  name: '@notification',
  initialState: INITIAL_STATE,
  reducers: {
    register: () => {},
    registerSuccess: (state) => {
      state.hasPermission = true
    },
    isRegisteredForRemoteNotifications: (state, payload: PayloadAction<boolean>) => {
      state.hasPermission = payload.payload
    },
    registerError: (state) => {
      state.hasPermission = false
    },
    receivedNotification: (state, { payload }: PayloadAction<TNotificationContent>) => {
      state.pending = [...state.pending, payload]
    },
    popPending: (state) => {
      if (state.pending.length > 0) {
        state.pending = state.pending.slice(1)
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authActions.logout, () => {
      return INITIAL_STATE
    })
  },
})

export const notificationActions = notificationSlice.actions
export const notificationReducer = notificationSlice.reducer
