import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { authActions } from './auth.slice'
import { TError } from './error.interface'

const INITIAL_STATE = {
  code: 0,
  message: '',
}

const errorSlice = createSlice({
  name: '@error',
  initialState: INITIAL_STATE,
  reducers: {
    error: (_, { payload }: PayloadAction<TError>) => payload,
    clear: () => INITIAL_STATE,
    doNothing: () => {},
    showAlert: (_, { payload }: PayloadAction<TError>) => payload,
  },
  extraReducers: (builder) => {
    builder.addCase(authActions.logout, () => {
      return INITIAL_STATE
    })
  },
})

export const errorActions = errorSlice.actions
export const errorReducer = errorSlice.reducer
