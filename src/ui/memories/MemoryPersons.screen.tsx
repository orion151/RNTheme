import { CommonStyles as C } from '@components/common/common.styles'
import { MainSNEnum } from '@navigation/NavigationHelpers'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { MemoryPersonsHooks } from '@ui/memories/MemoryPersons.hooks'
import { MemoryPersonsStyles as UI } from '@ui/memories/MemoryPersons.styles'
import React, { useCallback } from 'react'
import { FlatList, ListRenderItem } from 'react-native'

import { TPerson } from '../../types/TPerson'

export type MemoryPersonsScreenParam = {
  memoryId: string
}

export type MemoryPersonsScreenRouteProp = RouteProp<
  {
    [MainSNEnum.MemoryPersonsScreen]: MemoryPersonsScreenParam
  },
  MainSNEnum.MemoryPersonsScreen
>

export type MemoryPersonsScreenNavigationProp = StackNavigationProp<
  {
    [MainSNEnum.MemoryPersonsScreen]: MemoryPersonsScreenParam
  },
  MainSNEnum.MemoryPersonsScreen
>

const { useMemory } = MemoryPersonsHooks

const PersonKeyExtractor = (person: TPerson) => person.id
const PersonSeparator = () => <C.Empty height={25} />

const MemoryPersonsScreen: React.FC = () => {
  const { persons } = useMemory()
  const renderPerson: ListRenderItem<TPerson> = useCallback(({ item }) => {
    return <UI.PersonItemText>{item.nickname}</UI.PersonItemText>
  }, [])

  return (
    <UI.Container>
      <UI.Padding>
        <FlatList
          data={persons}
          renderItem={renderPerson}
          keyExtractor={PersonKeyExtractor}
          ItemSeparatorComponent={PersonSeparator}
        />
      </UI.Padding>
    </UI.Container>
  )
}

export default MemoryPersonsScreen
