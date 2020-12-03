import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { TLastReadTime } from '../../types/TLastReadTime'
import { authActions } from './auth.slice'

type State = {
  lastReadTimes: TLastReadTime[]
}

const INITIAL_STATE: State = {
  lastReadTimes: [],
}

const lastReadTimesSlice = createSlice({
  name: '@lastReadTimes',
  initialState: INITIAL_STATE,
  reducers: {
    loadLastReadTimesFromGraphQL: (_state, _action: PayloadAction<string>) => {
      // epic action
    },
    setLastReadTimes: (state, { payload: lastReadTimes }: PayloadAction<TLastReadTime[]>) => {
      state.lastReadTimes = lastReadTimes
    },
    updateLastReadTime: (_state, _action: PayloadAction<TLastReadTime>) => {
      // epic action
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authActions.logout, () => {
      return INITIAL_STATE
    })
  },
})

export const lastReadTimeActions = lastReadTimesSlice.actions
export const lastReadTimeReducer = lastReadTimesSlice.reducer
