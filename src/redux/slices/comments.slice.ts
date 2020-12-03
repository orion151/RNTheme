import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { TComment } from '../../types/TComment'
import { authActions } from './auth.slice'

type State = {
  comments: {
    // all comments regardless of memory
    [commentId: string]: TComment
  }
  keys: {
    [memoryId: string]: string[]
  }
}
const INITIAL_STATE: State = {
  comments: {},
  keys: {},
}

const commentsSlice = createSlice({
  name: '@comment',
  initialState: INITIAL_STATE,
  reducers: {
    loadCommentsForMemory: (_state, _action: PayloadAction<string>) => {
      // const comments: { [commentId: string]: TComment } = {}
      // const memoryId = FAKE_COMMENTS[0].memoryId
      // const keys = FAKE_COMMENTS.sort(sort).map((comment) => {
      //   comments[comment.id] = comment
      //   return comment.id
      // })
      // return { ...state, comments: { ...state.comments, ...comments }, keys: { ...state.keys, [memoryId]: keys } }
    },
    postComment: (_state, _action: PayloadAction<Pick<TComment, 'content' | 'memoryId'>>) => {
      // For the epic
    },
    add: (state, { payload }: PayloadAction<TComment[]>) => {
      const comments = { ...state.comments }
      const memoryIds = new Set<string>()
      payload.forEach((comment) => {
        const { id, memoryId } = comment
        comments[id] = comment
        memoryIds.add(memoryId)
      })
      const keys = Object.values(comments).reduce((a, b) => {
        const commentIds = a[b.memoryId] ?? []
        a[b.memoryId] = [...commentIds, b.id]
        return a
      }, {} as State['keys'])
      state.comments = comments
      state.keys = keys
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authActions.logout, (state) => {
      state.comments = {}
      state.keys = {}
    })
  },
})

export const commentsActions = commentsSlice.actions
export const commentsReducer = commentsSlice.reducer
