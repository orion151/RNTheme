import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { ExampleReduxObject, TemplateState } from './template.interface'

// MARKER_IMPORTS

const INITIAL_STATE: TemplateState = {
  exampleObject: {},
  // MARKER_INITIAL_STATE
}

const templateSlice = createSlice({
  name: '@template',
  initialState: INITIAL_STATE,
  reducers: {
    exampleTemplateAction: (_state, _action: PayloadAction<{ update: Partial<ExampleReduxObject> }>) => {
      /* reducer not needed */
    },
  },
})

export const templateActions = templateSlice.actions

export const templateReducer = templateSlice.reducer
