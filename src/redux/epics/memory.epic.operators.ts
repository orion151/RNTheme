import { EMPTY, Observable, asyncScheduler, from, scheduled, throwError } from 'rxjs'
import { concatAll, map, mergeMap, scan, switchMap } from 'rxjs/operators'

import { GraphQLService } from '../../services/GraphQL.service'
import { Progress, StorageService } from '../../services/Storage.service'
import { TSegment } from '../../types/TMemory'

type PhotoUploadResult = { type: 'photo'; index: number; key: string }
type StorytimeUploadResult = { type: 'storytime'; segmentId: string }
export type AnnotatedProgress = Progress & { type: 'progress'; label: string }
type UploadResult = PhotoUploadResult | StorytimeUploadResult
type Uploader = () => Observable<AnnotatedProgress | UploadResult>

type UploadSegmentParams = {
  graphql: GraphQLService
  storage: StorageService
  userId: string
  identityId: string
  memoryId: string
  segment: TSegment
}
type Typed<T extends string, Q> = { type: T } & Q
export function uploadSegment(params: UploadSegmentParams): Observable<AnnotatedProgress | Typed<'segment', TSegment>> {
  const { graphql, storage, userId, identityId, memoryId, segment } = params

  console.log(`graphql.addSegment with ${segment.photos.length} photos for ${userId}`)

  const createAndUpload = from(graphql.addSegment(userId, memoryId, identityId)).pipe(
    switchMap((segmentId) => {
      console.log('memoriesActions.createMemory', segmentId)
      if (!segmentId) return throwError({ type: 'createMemory', reason: 'cannot create segment' })
      const uploaders: Uploader[] = [
        [storytimeUploader(storage, segment, segmentId)],
        segment.photos.map((photo, index) => photoUploader(storage, photo.url, index, segmentId)),
      ].flat()
      return from(uploaders)
    }),
    mergeMap(
      (uploader): Observable<AnnotatedProgress | UploadResult> => {
        return uploader()
      },
    ),
  )

  const createUploadAndCompleted = scheduled([createAndUpload, from(['completed' as const])], asyncScheduler)

  type Summary = {
    type: 'uploads_complete' | 'in_progress'
    progress?: AnnotatedProgress
    segmentId?: string
    media: string[]
  }

  const gatherInfo = createUploadAndCompleted.pipe(
    concatAll(),
    scan(
      (summary, event) => {
        if (event === 'completed') {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { progress, ...remain } = summary
          return {
            ...remain,
            type: 'uploads_complete' as const,
          }
        }
        if (event.type === 'progress') {
          return {
            ...summary,
            progress: event,
            type: 'in_progress' as const,
          }
        }
        if (event.type === 'photo') {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { progress, ...remain } = summary
          remain.media = [...remain.media]
          remain.media[event.index] = event.key
          return {
            ...remain,
            type: 'in_progress' as const,
          }
        }
        if (event.type === 'storytime') {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { progress, ...remain } = summary
          remain.segmentId = event.segmentId
          return {
            ...remain,
            type: 'in_progress' as const,
          }
        }
        return summary
      },
      { media: [], completed: false, type: 'in_progress' as const } as Summary,
    ),
  )

  const result = gatherInfo.pipe(
    switchMap((p) => {
      if (p.type === 'uploads_complete') {
        console.log('gatherInfo.pipe uploads_complete')
        const segmentId = p.segmentId
        const media = p.media
        if (!segmentId) {
          return throwError('Missing segmentId or storytime')
        }
        return from(graphql.addSegmentMedia(segmentId, media)).pipe(
          switchMap((segment) => {
            if (!segment) {
              return throwError('Cannot update segment')
            }
            return from([{ type: 'segment' as const, ...segment }])
          }),
        )
      }
      const progress = p.progress
      if (progress) {
        console.log('gatherInfo.pipe progress', progress.total, progress.loaded)
        return from([progress])
      }
      return EMPTY
    }),
  )

  return result
}

function storytimeUploader(storage: StorageService, segment: TSegment, segmentId: string): Uploader {
  return () =>
    storage.uploadSegmentStorytime(segment.story.uri, segmentId).pipe(
      map((val): AnnotatedProgress | UploadResult => {
        console.log('storytimeUploader', val)
        if (typeof val === 'string') {
          return {
            type: 'storytime',
            segmentId,
          }
        }
        return { ...val, type: 'progress', label: 'Storytime' }
      }),
    )
}

function photoUploader(storage: StorageService, photoUrl: string, index: number, segmentId: string): Uploader {
  return () =>
    storage.uploadSegmentImage(photoUrl, segmentId).pipe(
      map((val): AnnotatedProgress | UploadResult => {
        console.log('photoUploader', val)
        if (typeof val === 'string') {
          return {
            index,
            type: 'photo',
            key: val,
          }
        }
        return { ...val, type: 'progress', label: `Photo ${index}` }
      }),
    )
}
