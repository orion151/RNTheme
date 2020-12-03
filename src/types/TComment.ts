import { TRemotePerson } from './TPerson'

export interface TComment {
  id: string
  owner: string
  content: string
  createdAt: string
  updatedAt: string
  memoryId: string
  person: TRemotePerson
}
