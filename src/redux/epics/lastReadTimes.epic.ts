import { TEpic } from '@redux/RootEpic'
import { lastReadTimeActions } from '@slices/lastReadTimes.slice'
import { memoriesActions } from '@slices/memories.slice'
import { AnyAction } from 'redux'
import { concatAll, filter, switchMap } from 'rxjs/operators'

const e: TEpic[] = []

e[e.length] = (action$, _state$, { graphql }) =>
  action$.pipe(
    filter(lastReadTimeActions.loadLastReadTimesFromGraphQL.match),
    switchMap(
      async ({ payload }): Promise<AnyAction[]> => {
        try {
          const times = await graphql.fetchLastReadTimes(payload)
          return [lastReadTimeActions.setLastReadTimes(times)]
        } catch (e) {
          console.log(e)
          return []
        }
      },
    ),
    concatAll(),
  )

e[e.length] = (action$, state$, { graphql }) =>
  action$.pipe(
    filter(lastReadTimeActions.updateLastReadTime.match),
    switchMap(
      async ({ payload }): Promise<AnyAction[]> => {
        const { sub: userId } = state$.value.user
        try {
          const memoryUserId = await graphql.updateLastReadTime(payload)
          if (!memoryUserId) {
            return []
          }
          return [memoriesActions.loadMemoriesFromGraphQL(userId)]
        } catch (e) {
          console.log(e)
          return []
        }
      },
    ),
    concatAll(),
  )

export const lastReadTimeEpics = e
