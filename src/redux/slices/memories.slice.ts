import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { MemoryStatus } from '../../API'
import { TMemory, TSegment } from '../../types/TMemory'
import { TLocalPerson, TPerson, TRemotePerson } from '../../types/TPerson'
import { AnnotatedProgress } from '../epics/memory.epic.operators'
import { authActions } from './auth.slice'
import { MemoriesState as State } from './memories.interface'

const TEMP: TMemory = {
  title: '',
  date: '',
  people: [],
  segments: [],
  id: '',
  person: { type: 'graphql' as const, id: '', nickname: '', profileImageUrl: undefined, phoneNumber: '' },
  isExpired: true,
  commentedDates: [],
}

const TEMP_SEGMENT: Omit<TSegment, 'createdAt' | 'id'> = {
  person: { type: 'graphql' as const, id: '', nickname: '', profileImageUrl: undefined, phoneNumber: '' },
  photos: [],
  story: {
    codec: '',
    uri: '',
    thumbnailUri: '',
  },
}

const INITIAL_STATE: State = {
  completedMemoryUpload: undefined,
  failedMemoryUpload: undefined,
  isRefreshingMemories: false,
  memories: [],
  archives: [],
  editing: TEMP,
  editingSegment: TEMP_SEGMENT,
}

type CreateMemoryParams = Pick<TMemory, 'title' | 'segments' | 'date' | 'status'> & {
  requestId: string
  people: TPerson[]
}

const memoriesSlice = createSlice({
  name: '@memories',
  initialState: INITIAL_STATE,
  reducers: {
    clear: () => {},
    loadMemoriesFromGraphQL: (state, _action: PayloadAction<string>) => {
      state.isRefreshingMemories = true
      // handled in epic
    },
    addUsersToMemory: (_state, _action: PayloadAction<{ memoryId: string; phoneNumbers: string[] }>) => {
      // epic action
    },
    createMemory: (_, _action: PayloadAction<CreateMemoryParams>) => {
      // epic action
    },
    addSegmentToMemory: (_, _action: PayloadAction<{ memoryId: string; segment: TSegment }>) => {
      // epic action
    },
    setMemories: (state, { payload: memories }: PayloadAction<TMemory[]>) => {
      state.isRefreshingMemories = false
      state.memories = memories
    },
    add: (state, { payload: memory }: PayloadAction<TMemory>) => {
      console.log('Adding a memory.')
      console.log(memory)
      return {
        ...state,
        memories: [...state.memories, memory],
      }
    },
    remove: (state, { payload: { id } }: PayloadAction<{ id: string }>) => {
      console.log('Deleting a memory.')
      console.log(id)
      return {
        ...state,
        memories: [...state.memories.filter((memory) => memory.id !== id)],
      }
    },
    edit: (state, { payload }: PayloadAction<Partial<Pick<TMemory, 'title' | 'date' | 'people'>>>) => {
      const editing = { ...state.editing, ...payload }
      const peopleMap = editing.people.reduce(
        (a, b) => ({ ...a, [b.id]: b }),
        {} as Record<string, TRemotePerson | TLocalPerson>,
      )
      const people = Object.values(peopleMap).sort((a, b) => {
        const aName = a.nickname
        const bName = b.nickname
        return aName < bName ? 1 : aName === bName ? 0 : -1
      })
      state.editing = { ...editing, people }
    },
    clearEdit: (state, _action) => {
      state.editing = TEMP
      state.editingSegment = TEMP_SEGMENT
    },
    editSegment: (state, { payload }: PayloadAction<Partial<TSegment>>) => {
      const previousSegment = state.editingSegment
      const segment = { ...previousSegment, ...payload }
      state.editingSegment = segment
    },
    removeIndexesPhoto: (state, { payload }: PayloadAction<number[]>) => {
      const previousSegment = state.editingSegment
      const copy = [...previousSegment.photos]
      for (const i of payload.sort((a, b) => b - a)) {
        copy.splice(i, 1)
      }
      const segment = { ...previousSegment, photos: copy }
      state.editingSegment = segment
    },
    publishMemory: (state, { payload }: PayloadAction<string>) => {
      state.memories = state.memories.map((m) => {
        if (m.id === payload && m.status === MemoryStatus.DRAFT) {
          return { ...m, status: MemoryStatus.PUBLISHED }
        }
        return m
      })
    },
    acceptInvitations: () => {
      /* epic handles this */
    },
    archiveMemory: (
      state,
      { payload: { memoryId, archived } }: PayloadAction<{ memoryId: string; archived: boolean }>,
    ) => {
      state.memories = state.memories.map((m) => {
        if (m.id === memoryId && m.status === MemoryStatus.PUBLISHED && archived) {
          return { ...m, status: MemoryStatus.ARCHIVED }
        }
        if (m.id === memoryId && m.status === MemoryStatus.ARCHIVED && !archived) {
          return { ...m, status: MemoryStatus.PUBLISHED }
        }
        return m
      })
    },
    uploadProgress: (state, { payload }: PayloadAction<AnnotatedProgress | undefined>) => {
      console.log(`${payload?.label}: ${payload?.loaded} / ${payload?.total}`)
      state.uploadProgress = payload
    },
    uploadComplete: (state, { payload }: PayloadAction<string>) => {
      state.completedMemoryUpload = payload
    },
    uploadFail: (state, { payload }: PayloadAction<string>) => {
      state.failedMemoryUpload = payload
    },
    clearUploadFail: (state, { payload }: PayloadAction<string>) => {
      if (state.failedMemoryUpload !== payload) {
        return
      }
      state.failedMemoryUpload = undefined
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authActions.logout, (state) => {
      state.completedMemoryUpload = undefined
      state.failedMemoryUpload = undefined
      state.isRefreshingMemories = false
      state.memories = []
      state.archives = []
      state.editing = TEMP
      state.editingSegment = TEMP_SEGMENT
    })
  },
})

export const memoriesActions = memoriesSlice.actions
export const memoriesReducer = memoriesSlice.reducer
