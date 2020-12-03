import { useActionSheet } from '@expo/react-native-action-sheet'
import { MainSNEnum, RootSNEnum } from '@navigation/NavigationHelpers'
import { useNavigation, useRoute } from '@react-navigation/native'
import { AppState } from '@redux/AppState'
import { MemoryDetailScreenRouteProp } from '@ui/memories/MemoryDetail.screen'
import { MemoryDetailStyles as UI } from '@ui/memories/MemoryDetail.styles'
import { useLastReadTime } from '@util/LastReadTime.util'
import { useASelector } from '@util/recipies.util'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Alert, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'

import { MemoryStatus } from '../../API'
import { memoriesActions } from '../../redux/slices/memories.slice'
import { TSegment } from '../../types/TMemory'
import { TPerson } from '../../types/TPerson'

export type TSegmentWithNew = TSegment & {
  isNew?: boolean
}

const useMemory = () => {
  const [title, setTitle] = useState<string>('')
  const [people, setPeople] = useState<TPerson[]>([])
  const [segments, setSegments] = useState<TSegmentWithNew[]>([])

  const route = useRoute<MemoryDetailScreenRouteProp>()
  const { memoryId } = route.params
  const memory = useASelector((state: AppState) => state.memories.memories.find((memory) => memory.id === memoryId))
  const navigation = useNavigation()
  const { navigate } = navigation
  const { showActionSheetWithOptions } = useActionSheet()
  const dispatch = useDispatch()
  const status = memory?.status ?? MemoryStatus.DRAFT

  const { lastReadTime, numberOfNewComments, isSegmentNew } = useLastReadTime(memoryId)

  const toSharedWith = useCallback(() => {
    navigate(MainSNEnum.MemoryPersonsScreen, { memoryId })
  }, [navigate, memoryId])

  const toSegmentDetail = useCallback(
    (segmentId: string) => {
      navigate(RootSNEnum.ViewSegmentStack, { segmentId })
    },
    [navigate],
  )

  const toAddSegment = useCallback(() => {
    navigate(RootSNEnum.CreateAMemoryStack, { peopleIds: [], memoryId })
  }, [navigate, memoryId])

  const showArchiveConfirmAlert = useCallback(() => {
    Alert.alert(
      'Are you sure you want to archive this memory?',
      'You won’t be able to view it anymore. This does not remove the memory from the recipient’s accounts.',
      [
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            dispatch(memoriesActions.archiveMemory({ memoryId, archived: true }))
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    )
  }, [dispatch, memoryId])

  const openMenu = useCallback(() => {
    const options = ['Cancel', 'Archive']
    const cancelButtonIndex = 0
    const destructiveButtonIndex = 1

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 1:
            showArchiveConfirmAlert()
            break
        }
      },
    )
  }, [showArchiveConfirmAlert])

  const publishMemory = useCallback(() => {
    memoriesActions.publishMemory(memoryId)
    Alert.alert(
      'Memory is being published',
      'This memory will be moved to the main tab and your friends can now view it.',
      [
        {
          text: 'Ok',
          style: 'default',
        },
      ],
    )
  }, [memoryId])

  useEffect(() => {
    if (memory === undefined) return
    setTitle(memory.title)
    setPeople(deDup(memory.people))
  }, [memory, setTitle, setPeople])

  useEffect(() => {
    if (memory === undefined) return
    setSegments(
      memory.segments.map((sg) => ({
        ...sg,
        isNew: isSegmentNew(sg),
      })),
    )
  }, [memory, setSegments, lastReadTime, isSegmentNew])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={openMenu}>
          <UI.ActionIcon />
        </TouchableOpacity>
      ),
      headerTitle: title,
    })
  }, [navigation, title, openMenu])

  const viewComments = useCallback(() => {
    navigate(RootSNEnum.MemoryDetailsStack, { memoryId })
  }, [navigate])

  return {
    people,
    segments,
    toSharedWith,
    toSegmentDetail,
    toAddSegment,
    viewComments,
    numberOfNewComments,
    status,
    publishMemory,
  }
}

function deDup<T extends { id: string }>(a: T[]): T[] {
  const keys = new Set<string>()
  return a.filter((element) => {
    const isDup = keys.has(element.id)
    if (isDup) {
      return false
    }
    keys.add(element.id)
    return true
  })
}

export const MemoryDetailHooks = { useMemory }
