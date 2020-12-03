import { TStory } from '@redux/slices/TStory'

import { MemoryStatus } from '../API'
import { TPerson, TRemotePerson } from './TPerson'
import { TPhoto } from './TPhoto'

export interface TSegment {
  id: string
  createdAt: string
  person: TRemotePerson
  photos: TPhoto[]
  story: TStory
}

export function getMemoryThumbnails(memory: TMemory): TPhoto | undefined {
  return memory.segments.reduce((a, b) => {
    return a || b.photos[0]
  }, undefined as TPhoto | undefined)
}

export interface TMemory {
  id: string
  title: string
  owner?: string
  person: TRemotePerson
  date: string
  userId?: string
  description?: string
  createdAt?: string
  updatedAt?: string
  people: TPerson[]
  segments: TSegment[]
  status?: MemoryStatus
  isExpired: boolean
  commentedDates: string[]
  xxxx: string
}

export type TMemoryOptional = TMemory | undefined

export interface TMemoryGroup {
  id: string
  title: string
  memories: TMemory[]
  peopleIds: string[]
}

function getMemoryPeopleIds(memory: TMemory): string[] {
  return [...new Set(memory.people.map((p) => p.id))].sort()
}

export function getMemoryGroupId(memory: TMemory): string {
  const peopleIds = getMemoryPeopleIds(memory)
  return peopleIds.join(',')
}

export function getMemoryGroupTitle(memory: TMemory): string {
  const peopleIds = getMemoryPeopleIds(memory)
  return peopleIds
    .map((id) => {
      return memory.people.find((p) => p.id === id)?.nickname ?? ''
    })
    .join(', ')
}
