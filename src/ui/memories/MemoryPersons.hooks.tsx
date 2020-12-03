import { CreateAMemorySNEnum } from '@navigation/NavigationHelpers'
import { useNavigation, useRoute } from '@react-navigation/native'
import { AppState } from '@redux/AppState'
import { MemoryDetailScreenRouteProp } from '@ui/memories/MemoryDetail.screen'
import { MemoryPersonsStyles as UI } from '@ui/memories/MemoryPersons.styles'
import { useASelector } from '@util/recipies.util'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'

import { TPerson } from '../../types/TPerson'

const useMemory = () => {
  const [persons, setPersons] = useState<TPerson[]>([])

  const route = useRoute<MemoryDetailScreenRouteProp>()
  const { memoryId } = route.params
  const memory = useASelector((state: AppState) => state.memories.memories.find((memory) => memory.id === memoryId))
  const navigation = useNavigation()
  const { navigate } = navigation

  const toAddPerson = useCallback(() => {
    const peopleIds = persons.map((p) => p.id)
    console.log(`navigate(CreateAMemorySNEnum.AddPerson, {peopleIds, memoryId})`, peopleIds, memoryId)
    // @NOTE It shares the same screen used in creating a memory, fix it as needed.
    navigate(CreateAMemorySNEnum.AddPerson, { peopleIds, memoryId })
  }, [navigate, persons.map((p) => p.id).join(''), memoryId])

  useEffect(() => {
    if (memory === undefined) return
    setPersons(memory.people)
  }, [memory, setPersons])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toAddPerson}>
          <UI.AddPersonIcon />
        </TouchableOpacity>
      ),
      headerTitle: 'Shared With',
    })
  }, [navigation, toAddPerson])

  return {
    persons,
  }
}

export const MemoryPersonsHooks = { useMemory }
