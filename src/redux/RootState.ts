import { rootReducer } from './RootReducer'
import { contactsReducer } from './slices/contacts.slice'

export type RootState = ReturnType<typeof rootReducer>
export type TContactsState = ReturnType<typeof contactsReducer>
