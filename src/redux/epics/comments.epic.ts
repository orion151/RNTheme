import { TEpic } from '@redux/RootEpic'
import { commentsActions } from '@redux/slices/comments.slice'
import { onError } from '@util/onError.util'
import { AnyAction } from 'redux'
import { concatAll, filter, switchMap } from 'rxjs/operators'

const e: TEpic[] = []

e[e.length] = (action$, state$, { graphql }) =>
  action$.pipe(
    filter(commentsActions.loadCommentsForMemory.match),
    switchMap(
      async ({ payload }): Promise<AnyAction[]> => {
        try {
          const memoryId = payload
          const comments = await graphql.fetchComments(memoryId)
          return [commentsActions.add(comments)]
        } catch (e) {}
        return []
      },
    ),
    concatAll(),
    onError(state$),
  )

e[e.length] = (action$, state$, { graphql }) =>
  action$.pipe(
    filter(commentsActions.postComment.match),
    switchMap(
      async ({ payload: comment }): Promise<AnyAction[]> => {
        try {
          const userId = state$.value.user.sub
          const result = await graphql.postComment(userId, comment)
          return [commentsActions.add(result ? [result] : [])]
        } catch (e) {}
        return []
      },
    ),
    concatAll(),
    onError(state$),
  )

export const commentsEpics = e
