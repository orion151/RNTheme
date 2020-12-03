import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { getE164FormattedPhoneNumber } from '@util/PhoneNumber.util'
import { Contact } from 'react-native-contacts'

import { TLocalPerson, TPerson } from '../../types/TPerson'
import { authActions } from './auth.slice'

type State = {
  people: Record<string, TPerson>
}

const initialState: State = {
  people: {},
}

const peopleSlice = createSlice({
  name: '@people',
  initialState,
  reducers: {
    setPeople: (state, { payload }: PayloadAction<Record<string, TPerson>>) => {
      state.people = { ...payload }
    },
    mergePeople: (state, { payload }: PayloadAction<Record<string, TPerson>>) => {
      const allPeople: Record<string, TPerson> = { ...state.people, ...payload }
      const remotePeople = Object.values(allPeople).flatMap((p) => (p.type === 'graphql' ? [p] : []))
      const localPeople = Object.values(allPeople).flatMap((p) => (p.type === 'contacts' ? [p] : []))
      const remotePhoneNumbers = remotePeople.map((p) => p.phoneNumber)
      const entries = localPeople.flatMap((p) => {
        const formattedPhoneNumbers = p.phoneNumbers.flatMap((newValue) => getE164FormattedPhoneNumber(newValue))
        console.log(formattedPhoneNumbers)
        const entry: [string, string][] = formattedPhoneNumbers.map((ph) => {
          const result: [string, string] = [ph, p.id]
          return result
        })
        console.log(`entry ${JSON.stringify(entry)}`)
        return entry
      })
      console.log(`entries ${JSON.stringify(entries)}`)
      const localPhoneToIdMap: Record<string, string> = Object.fromEntries(entries)
      console.log(`remotePhoneNumbers ${remotePhoneNumbers}`)
      console.log(`localPhoneToIdMap ${JSON.stringify(localPhoneToIdMap)}`)
      const duplicateLocalIds = remotePhoneNumbers.reduce((a, b) => {
        const localPhoneId = localPhoneToIdMap[b]
        if (localPhoneId) {
          return [...a, localPhoneId]
        }
        return a
      }, [] as string[])
      console.log(`duplicateLocalIds ${duplicateLocalIds}`)
      const duplicateLocalIdSet = new Set(duplicateLocalIds)
      const newLocalPeople = localPeople.filter((p) => !duplicateLocalIdSet.has(p.id))
      const newPeople = [...remotePeople, ...newLocalPeople]
      const newEntries = newPeople.map((p) => [p.id, p] as [string, TPerson])
      state.people = Object.fromEntries(newEntries)
    },
    addContacts: (state, { payload }: PayloadAction<Contact[]>) => {
      // FIXME: Eventually this data will be provided
      // by a GraphQL operation that receives new contacts
      // that were added back from the cloud
      const savedPeople: Record<string, TLocalPerson> = Object.fromEntries(
        payload.map((contact) => {
          const localPerson: TLocalPerson = {
            type: 'contacts' as const,
            id: contact.recordID,
            middleName: contact.middleName,
            givenName: contact.givenName,
            familyName: contact.familyName,
            nickname: `${contact.givenName} ${contact.familyName.substr(0, 1)}.`,
            phoneNumbers: contact.phoneNumbers.map((pn) => getE164FormattedPhoneNumber(pn.number)),
          }
          return [contact.recordID, localPerson]
        }),
      )
      const result = { ...state.people, ...savedPeople }

      state.people = result
    },
    remove: (state, { payload }: PayloadAction<string>) => {
      // FIXME: Eventually this data will be provided
      // by a GraphQL operation that deletes the person
      const result = { ...state.people }
      delete result[payload]
      state.people = result
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authActions.logout, () => {
      return initialState
    })
  },
})

export const peopleActions = peopleSlice.actions
export const peopleReducer = peopleSlice.reducer
