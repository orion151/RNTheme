import { MemoryCard } from '@components/MemoryCard.component'
import { MainSNEnum } from '@navigation/NavigationHelpers'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { MemoriesHooks } from '@ui/memories/Memories.hooks'
import { MemoriesStyles as UI } from '@ui/memories/Memories.styles'
import React, { useCallback, useLayoutEffect } from 'react'
import { FlatList, ListRenderItemInfo } from 'react-native'

import { TMemory } from '../../types/TMemory'
import { AddMemoryCard } from '../components/AddMemoryCard.component'

const { useMemories } = MemoriesHooks

export type PersonalMemoriesScreenParam = {
  groupId: string
  groupTitle: string
}

export type PersonalMemoriesScreenRouteProp = RouteProp<
  {
    [MainSNEnum.PersonalMemoriesScreen]: PersonalMemoriesScreenParam
  },
  MainSNEnum.PersonalMemoriesScreen
>

export type PersonalMemoriesScreenNavigationProp = StackNavigationProp<
  {
    [MainSNEnum.PersonalMemoriesScreen]: PersonalMemoriesScreenParam
  },
  MainSNEnum.PersonalMemoriesScreen
>

export const PersonalMemoriesScreen: React.FC = () => {
  const { groups, refreshMemories, isRefreshingMemories } = useMemories()
  const route = useRoute<PersonalMemoriesScreenRouteProp>()
  const { groupTitle, groupId } = route.params
  // Finds the group by the id passed through route params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const group = groups.find((g) => g.id === groupId)
  const memories = group?.memories ?? []
  const peopleIds = group?.peopleIds
  const data: (TMemory | 'add_button')[] = [...memories, 'add_button']

  const { setOptions } = useNavigation()

  useLayoutEffect(() => {
    setOptions({
      title: groupTitle,
    })
  }, [groupTitle])

  const keyExtractor = useCallback((item: TMemory | 'add_button') => (item === 'add_button' ? item : item.id), [])
  const renderListItem = useCallback(
    (listRenderItem: ListRenderItemInfo<TMemory | 'add_button'>) => renderItem(listRenderItem.item),
    [],
  )
  const renderItem = useCallback(
    (item: TMemory | 'add_button') =>
      item === 'add_button' ? (
        <AddMemoryCard compact={false} contactIds={peopleIds} />
      ) : (
        <MemoryCard memory={item} compact={false} />
      ),
    [],
  )

  return (
    <UI.Container>
      <FlatList<TMemory | 'add_button'>
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderListItem}
        onRefresh={refreshMemories}
        refreshing={isRefreshingMemories}
      />
    </UI.Container>
  )
}
