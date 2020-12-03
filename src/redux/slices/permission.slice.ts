import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { Permission } from 'react-native-permissions'

type State = {
  granted: Permission[]
  denied: Permission[]
  blocked: Permission[]
}
const INITIAL_STATE: State = {
  granted: [],
  denied: [],
  blocked: [],
}

const permissionSlice = createSlice({
  name: '@permission',
  initialState: INITIAL_STATE,
  reducers: {
    check: (_, {}: PayloadAction<Permission[]>) => {},
    request: (_, {}: PayloadAction<Permission[]>) => {},
    onRequested: (_, { payload }: PayloadAction<State>) => payload,
    granted: (state, { payload }: PayloadAction<Permission[]>) => {
      state.granted = [...new Set<Permission>([...state.granted, ...payload])]
    },
    denied: (state, { payload }: PayloadAction<Permission[]>) => {
      state.denied = [...new Set<Permission>([...state.denied, ...payload])]
    },
    blocked: (state, { payload }: PayloadAction<Permission[]>) => {
      state.blocked = [...new Set<Permission>([...state.blocked, ...payload])]
    },
    clear: () => INITIAL_STATE,
  },
})

export const permissionAction = permissionSlice.actions
export const permissionReducer = permissionSlice.reducer
