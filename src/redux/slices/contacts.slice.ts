import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { Contact } from 'react-native-contacts'

type State = {
  keys: string[]
  contacts: { [recordID: string]: Contact }
  selected: { [recordID: string]: boolean }
}
const INITIAL_STATE: State = {
  keys: [],
  contacts: {},
  selected: {},
}

const contactsSlice = createSlice({
  name: '@contacts',
  initialState: INITIAL_STATE,
  reducers: {
    getContacts: () => {},
    setContacts: (state, { payload }: PayloadAction<Omit<State, 'saved' | 'selected'>>) => {
      return { ...state, ...payload }
    },
    select: (state, { payload }: PayloadAction<{ recordID: string; selected: boolean }>) => {
      const { selected, recordID } = payload
      return { ...state, selected: { ...state.selected, [recordID]: selected } }
    },
    selectMultiple: (state, { payload }: PayloadAction<string[]>) => {
      const selected: { [key: string]: boolean } = {}
      payload.forEach((key) => (selected[key] = true))
      state.selected = selected
    },
    clearSelect: (state, _action) => {
      state.selected = {}
    },
    save: () => {
      // no op: so epic can fire off graphql operations
      // const selected = Object.keys(state.selected).filter((key) => state.selected[key])
      // const saved = [...state.saved, ...selected]
      // // unique
      // return { ...state, selected: {}, saved: [...new Set(saved)] }
    },
    // remove: (state, { payload }: PayloadAction<string>) => {
    //   return { ...state, saved: state.saved.filter((x) => x !== payload) }
    // },
  },
})

export const contactsActions = contactsSlice.actions
export const contactsReducer = contactsSlice.reducer
