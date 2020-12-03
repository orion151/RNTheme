export interface TRemotePerson {
  type: 'graphql'
  id: string
  nickname: string
  phoneNumber: string
  profileImageUrl: string | undefined
}

/* A person who is known from contacts, they may
  have been invited to join a memory but don't yet
  have a user object in graphql, only an Invitation */
export interface TLocalPerson {
  type: 'contacts'
  id: string // From contacts API recordID
  phoneNumbers: string[]
  middleName: string
  givenName: string
  familyName: string
  nickname: string // create this from givenName
}

export type TPerson = TRemotePerson | TLocalPerson
