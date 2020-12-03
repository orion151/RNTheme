import { TEpic } from '@redux/RootEpic'
import { authActions } from '@slices/auth.slice'
import { commentsActions } from '@slices/comments.slice'
import { lastReadTimeActions } from '@slices/lastReadTimes.slice'
import { onError } from '@util/onError.util'
import { AnyAction } from 'redux'
import { Observable, asyncScheduler, from, scheduled, throwError } from 'rxjs'
import { catchError, concatAll, distinctUntilChanged, filter, map, mergeMap, switchMap } from 'rxjs/operators'

import { TMemory } from '../../types/TMemory'
import { memoriesActions } from '../slices/memories.slice'
import { uploadSegment } from './memory.epic.operators'

const e: TEpic[] = []

e[e.length] = (_action$, state$, _services) =>
  state$.pipe(
    map((state) => state.user.sub),
    distinctUntilChanged(),
    filter((sub) => sub !== ''),
    map((): AnyAction[] => {
      console.log('memories authActions.signIn')
      return [memoriesActions.acceptInvitations()]
    }),
    concatAll(),
  )

e[e.length] = (action$, _state$, { graphql }) =>
  action$.pipe(
    filter(memoriesActions.loadMemoriesFromGraphQL.match),
    switchMap(
      async ({ payload }): Promise<AnyAction[]> => {
        try {
          console.log('memoriesActions.loadMemoriesFromGraphQL', payload)

          const { memories, isFullFeatureEnabled } = await graphql.fetchMemories(payload)
          console.log('memoriesActions.loadMemoriesFromGraphQL', memories[0])
          const loadCommentActions = memories.map((memory) => commentsActions.loadCommentsForMemory(memory.id))
          return [
            authActions.setFullFeatureEnabled(isFullFeatureEnabled),
            memoriesActions.setMemories(memories),
            lastReadTimeActions.loadLastReadTimesFromGraphQL(payload),
            ...loadCommentActions,
          ]
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
    filter(memoriesActions.archiveMemory.match),
    switchMap(
      async ({ payload: { memoryId, archived } }): Promise<AnyAction[]> => {
        try {
          console.log('memoriesActions.archiveMemory', memoryId)
          const userId = state$.value.user.sub
          const success = await graphql.archiveMemory(userId, memoryId, archived)
          if (success) {
            return []
          } else {
            console.log('FAILED TO ARCHIVE MEMORY')
            return []
          }
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
    filter(memoriesActions.acceptInvitations.match),
    switchMap(
      async (): Promise<AnyAction[]> => {
        try {
          const userId = state$.value.user.sub
          console.log('memoriesActions.acceptInvitations', userId)
          const success = await graphql.acceptInvitations()
          if (success) {
            return [memoriesActions.loadMemoriesFromGraphQL(userId)]
          } else {
            console.log('FAILED TO ACCEPT INVITATIONS')
            return []
          }
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
    filter(memoriesActions.addUsersToMemory.match),
    switchMap(
      async ({ payload: { memoryId, phoneNumbers } }): Promise<AnyAction[]> => {
        try {
          const userId = state$.value.user.sub
          const success = await graphql.inviteUsersToJoinMemory(memoryId, phoneNumbers)
          if (success) {
            return [memoriesActions.loadMemoriesFromGraphQL(userId)]
          } else {
            console.log('FAILED TO INVITE USERS TO JOIN MEMORY')
            return []
          }
        } catch (e) {
          console.log(e)
          return []
        }
      },
    ),
    concatAll(),
  )

e[e.length] = (action$, state$, { graphql, storage }) =>
  action$.pipe(
    filter(memoriesActions.createMemory.match),
    switchMap(
      ({ payload: memory }): Observable<AnyAction> => {
        const { sub: userId, identityId } = state$.value.user
        console.log('memoriesActions.createMemory', memory)
        if (memory.segments.length < 1) {
          return from(Promise.reject('invalid memory: must have at least 1 segment'))
        }
        const phoneNumbers = memory.people.flatMap((p) => {
          if (p.type === 'graphql') {
            return [p.phoneNumber]
          }
          // localperson
          return p.phoneNumbers
        })
        const requestId = memory.requestId
        const memoryResult = graphql.createMemory(userId, { ...memory, id: requestId })
        const uploads = from(memoryResult).pipe(
          switchMap(
            (memoryResult): Observable<TMemory> => {
              /* Using switchMap so can return throwError if invalid */
              console.log('memoriesActions.createMemory', memoryResult)
              if (!memoryResult) return throwError({ type: 'createMemory', reason: 'cannot create memory' })
              return from([memoryResult])
            },
          ),
          mergeMap((newMemory) => {
            /* merge map will run every segment upload to completion */
            const { id: memoryId } = newMemory
            const { segments } = memory
            console.log('memoriesActions.createMemory Upload Segments', segments.length)
            const segmentUploads = segments.map((segment) => {
              return uploadSegment({
                graphql,
                storage,
                userId,
                identityId,
                memoryId,
                segment,
              })
            })
            const addOwnerAsMemoryUser = from(graphql.addMemoryUser(memoryId, userId)).pipe(
              map((memoryUserId) => ({ type: 'memory_user' as const, memoryUserId })),
            )
            console.log('graphql.inviteUsersToJoinMemory', memoryId, phoneNumbers)
            const invitePhoneNumbers = from(graphql.inviteUsersToJoinMemory(memoryId, phoneNumbers)).pipe(
              map((memoryUserId) => ({ type: 'memory_user' as const, memoryUserId })),
            )
            return [
              ...segmentUploads,
              addOwnerAsMemoryUser,
              invitePhoneNumbers,
              from([{ type: 'memory' as const, memoryId }]),
            ]
          }),
          concatAll(),
          switchMap((e) => {
            if (e.type === 'progress') {
              return [memoriesActions.uploadProgress(e)]
            }
            if (e.type === 'segment') {
              console.log(`Segment upload complete: ${e.id}`)
              return []
            }
            if (e.type === 'memory') {
              return [memoriesActions.loadMemoriesFromGraphQL(userId)]
            }
            return []
          }),
        )

        const start = memoriesActions.uploadProgress({
          type: 'progress' as const,
          label: 'Uploading memory',
          total: 1,
          loaded: 0,
        })
        const end = memoriesActions.uploadProgress(undefined)
        const completed = memoriesActions.uploadComplete(requestId)
        try {
          const seq = scheduled([from([start]), uploads, from([end, completed])], asyncScheduler)
          return seq.pipe(concatAll())
        } catch (e) {
          console.log(e)
          return from([memoriesActions.uploadFail(requestId)])
        }
      },
    ),
    catchError((err, src) => {
      console.log('ERRORR!!!!', err)
      return src
    }),
    onError(state$),
  )

e[e.length] = (action$, state$, { graphql, storage }) =>
  action$.pipe(
    filter(memoriesActions.addSegmentToMemory.match),
    switchMap(
      ({ payload }): Observable<AnyAction> => {
        const { memoryId, segment } = payload
        const { sub: userId, identityId } = state$.value.user
        console.log('memoriesActions.addSegmentToMemory', payload)
        const uploads = from([segment]).pipe(
          mergeMap((newSegment) => {
            /* merge map will run every segment upload to completion */
            const segmentUpload = uploadSegment({
              graphql,
              storage,
              userId,
              identityId,
              memoryId,
              segment: newSegment,
            })
            return [segmentUpload, from([{ type: 'memory' as const, memoryId }])]
          }),
          concatAll(),
          switchMap((e) => {
            if (e.type === 'progress') {
              return [memoriesActions.uploadProgress(e)]
            }
            if (e.type === 'segment') {
              console.log(`Segment upload complete: ${e.id}`)
              return []
            }
            if (e.type === 'memory') {
              return [memoriesActions.loadMemoriesFromGraphQL(userId)]
            }
            return []
          }),
        )

        const start = memoriesActions.uploadProgress({
          type: 'progress' as const,
          label: 'Uploading memory',
          total: 1,
          loaded: 0,
        })
        const end = memoriesActions.uploadProgress(undefined)
        const completed = memoriesActions.uploadComplete(memoryId)
        const seq = scheduled([from([start]), uploads, from([end, completed])], asyncScheduler)
        return seq.pipe(concatAll())
      },
    ),
    catchError((err, src) => {
      console.log('ERRORR!!!!', err)
      return src
    }),
    onError(state$),
  )

export const memoriesEpics = e
