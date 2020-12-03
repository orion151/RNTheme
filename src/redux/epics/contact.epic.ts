import { TEpic } from '@redux/RootEpic'
import { TContactsState } from '@redux/RootState'
import { contactsActions } from '@redux/slices/contacts.slice'
import { onError } from '@util/onError.util'
import Contacts from 'react-native-contacts'
import { AnyAction } from 'redux'
import { concatAll, filter, map, switchMap } from 'rxjs/operators'

import { AppState } from '../AppState'
import { peopleActions } from '../slices/people.slice'

const e: TEpic[] = []

e[e.length] = (action$, state$) =>
  action$.pipe(
    filter(contactsActions.getContacts.match),
    switchMap(getAllContacts),
    map((contacts) => {
      const state: Omit<TContactsState, 'saved' | 'selected'> = {
        keys: [],
        contacts: {},
      }

      state.keys = contacts.map((c) => {
        state.contacts[c.recordID] = c
        return c.recordID
      })

      return state
    }),
    map(contactsActions.setContacts),
    onError(state$),
  )

e[e.length] = (action$, state$) =>
  action$.pipe(
    filter(contactsActions.save.match),
    map((): AnyAction[] => {
      const appState: AppState = state$.value
      const state = appState.contacts
      const toSave = Object.keys(state.selected).flatMap((key) => (state.contacts[key] ? [state.contacts[key]] : []))

      return [peopleActions.addContacts(toSave), contactsActions.clearSelect({})]
    }),
    concatAll(),
    onError(state$),
  )

export const contactEpics = e

const getAllContacts = () =>
  new Promise<Contacts.Contact[]>((resolve, reject) => {
    Contacts.getAll((error, contacts) => {
      if (error) {
        return reject(error)
      }
      const hasName = contacts.filter((c) => c.givenName || c.familyName)
      resolve(hasName)
    })
  })
