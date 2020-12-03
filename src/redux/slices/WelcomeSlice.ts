import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export const welcomeSlice = createSlice({
  name: '@welcome',
  initialState: {},
  reducers: {
    welcome(_state, _action: PayloadAction<string>) {},
  },
})

export const WelcomeActions = welcomeSlice.actions
