import { MemoryCard } from '@components/MemoryCard.component'
import { MainSNEnum } from '@navigation/NavigationHelpers'
import { useNavigation } from '@react-navigation/native'
import { MemoriesHooks } from '@ui/memories/Memories.hooks'
import { MemoriesStyles as UI } from '@ui/memories/Memories.styles'
import { PersonalMemoriesScreenNavigationProp } from '@ui/memories/PersonalMemories.screen'
import React, { useCallback } from 'react'
import { FlatList, ListRenderItemInfo, TouchableOpacity } from 'react-native'

import { TMemoryGroup } from '../../types/TMemory'
import { AddMemoryCard } from '../components/AddMemoryCard.component'

const { useMemories } = MemoriesHooks

export const MemoriesByPersonScreen = () => {
  const { groups, refreshMemories, isRefreshingMemories } = useMemories()
  const { navigate } = useNavigation<PersonalMemoriesScreenNavigationProp>()

  // Slices each group by at most 3 memories
  const dataForCompact: TMemoryGroup[] = [...groups].map((group) => ({
    ...group,
    memories: [...group.memories],
  }))

  const keyExtractorForCompact = useCallback((item: TMemoryGroup, index) => (item ? item.id : index), [])
  const renderListItemForCompact = useCallback(
    (listRenderItem: ListRenderItemInfo<TMemoryGroup>) => renderItemForCompact(listRenderItem.item),
    [],
  )
  const renderItemForCompact = useCallback(
    (item: TMemoryGroup) => (
      <>
        <UI.PersonHeaderContainer>
          <UI.PersonHeaderTitleText>{item.title}</UI.PersonHeaderTitleText>
          <TouchableOpacity
            onPress={() => navigate(MainSNEnum.PersonalMemoriesScreen, { groupId: item.id, groupTitle: item.title })}
            style={{
              justifyContent: 'center',
            }}
          >
            {item.memories.length > 0 && (
              <UI.PersonHeaderSubTitleText>{`View all (${item.memories.length})`}</UI.PersonHeaderSubTitleText>
            )}
          </TouchableOpacity>
        </UI.PersonHeaderContainer>
        <UI.PersonMemoriesContainer>
          {item.memories.slice(0, 3).map((memory, index) => (
            <MemoryCard key={memory ? memory.id : index.toString()} memory={memory} compact />
          ))}
          <AddMemoryCard compact contactIds={item.peopleIds} />
        </UI.PersonMemoriesContainer>
      </>
    ),
    [],
  )

  return (
    <UI.Container>
      <FlatList<TMemoryGroup>
        data={dataForCompact}
        keyExtractor={keyExtractorForCompact}
        renderItem={renderListItemForCompact}
        onRefresh={refreshMemories}
        refreshing={isRefreshingMemories}
        style={{
          paddingHorizontal: 12,
        }}
      />
    </UI.Container>
  )
}
