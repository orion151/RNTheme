import { useASelector } from '@util/recipies.util'
import { DateTime } from 'luxon'
import { useCallback } from 'react'

import { MemoryStatus } from '../../API'
import { useMemoriesAction } from '../../hooks/useAction.hook'
import { TMemory, TMemoryGroup, getMemoryGroupId, getMemoryGroupTitle } from '../../types/TMemory'

const useMemories = () => {
  // Retrieves the published memories from store.
  const memories = useASelector((state) =>
    state.memories.memories.filter((memory) => memory.status === MemoryStatus.PUBLISHED),
  )

  const lastReadTimes = useASelector((state) => state.lastReadTimes.lastReadTimes)
  const memoryHasNewItem = useCallback(
    (memory: TMemory) => {
      // Finds the last read time for the memory
      const lastReadTime = lastReadTimes.find((time) => time.memoryId === memory.id)
      if (!lastReadTime) {
        // Not found, then assumes that it has new items.
        return true
      }
      // Search new segments if any.
      const hasNewItem = !!memory.segments.find((segment) => {
        const lastReadSegmentDateTime = lastReadTime.lastReadSegmentDateTime
        if (!lastReadSegmentDateTime) {
          // The memory has more than one segments, but not found last segment read time, then assumes that it has new items.
          return true
        }
        // Finds at least one that was created after the last segment read time.
        return DateTime.fromISO(segment.createdAt) > DateTime.fromISO(lastReadSegmentDateTime)
      })
      if (hasNewItem) {
        // Once determined that the memory has new segments, then no need to search new comments, just returns here.
        return true
      }
      // Search new comments if any, commented dates mean that the createdAt of each comments on the memory
      return !!memory.commentedDates.find((date) => {
        const lastReadCommentDateTime = lastReadTime.lastReadCommentDateTime
        if (!lastReadCommentDateTime) {
          // The memory has more than one comments, but not found last comment read time, then assumes that it has new items.
          return true
        }
        // Finds at least one that was created after the last comment read time.
        return DateTime.fromISO(date) > DateTime.fromISO(lastReadCommentDateTime)
      })
    },
    [lastReadTimes],
  )
  const getMemoryModifiedDate = useCallback((memory: TMemory) => {
    // Sorts the segments by its created date, most recent one as first.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sortedSegments = [...memory.segments].sort((a, b) => {
      return DateTime.fromISO(b.createdAt).diff(DateTime.fromISO(a.createdAt)).milliseconds
    })
    // Sorts the comments by its created date, most recent one as first.
    const sortedComments = [...memory.commentedDates].sort((a, b) => {
      return DateTime.fromISO(b).diff(DateTime.fromISO(a)).milliseconds
    })
    // Combines three dates of the most recent segment, the most recent comment and the memory,
    // then filter out any of nulls, then find the most recent one, that is the modified date of the memory.
    return [sortedSegments[0]?.createdAt, sortedComments[0], memory.createdAt]
      .filter(Boolean)
      .map((t) => DateTime.fromISO(t ?? ''))
      .sort()
      .reverse()[0]
  }, [])

  // Sort memories by whether the memory has any new comments or any unviewed segments, and then most recently modified as first.
  const sortedMemories = [...memories].sort((a, b) => {
    const aHasNewItem = memoryHasNewItem(a)
    const bHasNewItem = memoryHasNewItem(b)

    // The memory having new item will go first
    if (aHasNewItem && !bHasNewItem) {
      return -1
    }
    if (!aHasNewItem && bHasNewItem) {
      return 1
    }

    // If two memories have new items or not have new items, compares the modified dates
    const aCreatedAt = getMemoryModifiedDate(a)
    const bCreatedAt = getMemoryModifiedDate(b)
    if (aCreatedAt > bCreatedAt) {
      return -1
    }
    if (aCreatedAt < bCreatedAt) {
      return 1
    }

    return 0
  })

  // Categories memories by group, and then sort the group by the modified date
  const groupIds = [...new Set(sortedMemories.map((memory) => getMemoryGroupId(memory)).filter(Boolean))]
  const groups: TMemoryGroup[] = groupIds
    .map((gid) => {
      const memoriesInGroup = sortedMemories.filter((m) => gid === getMemoryGroupId(m))
      return {
        id: gid,
        title: getMemoryGroupTitle(memoriesInGroup[0]),
        memories: memoriesInGroup,
        // Each memory has same people, because memories are in the same group. So uses the first memory to retrieves people
        peopleIds: (memoriesInGroup[0]?.people ?? []).map((p) => p.id),
      }
    })
    .sort((a, b) => {
      const aModifiedAt = getMemoryModifiedDate(a.memories[0])
      const bModifiedAt = getMemoryModifiedDate(b.memories[0])
      return bModifiedAt.diff(aModifiedAt).milliseconds
    })

  const isRefreshingMemories = useASelector((state) => state.memories.isRefreshingMemories)
  const userId = useASelector((state) => state.user.sub)
  const refreshMemoriesWithUserId = useMemoriesAction('loadMemoriesFromGraphQL')

  const refreshMemories = useCallback(() => {
    refreshMemoriesWithUserId(userId)
  }, [refreshMemoriesWithUserId, userId])
  return { memories, sortedMemories, groups, refreshMemories, isRefreshingMemories, getMemoryModifiedDate }
}

export const MemoriesHooks = { useMemories }
