import { MemoryCard } from '@components/MemoryCard.component'
import { MemoriesHooks } from '@ui/memories/Memories.hooks'
import { MemoriesStyles as UI } from '@ui/memories/Memories.styles'
import React, { useCallback } from 'react'
import { FlatList, ListRenderItemInfo } from 'react-native'

import { TMemory } from '../../types/TMemory'

const { useMemories } = MemoriesHooks

export const MemoriesByDateScreen = () => {
  const { memories, refreshMemories, isRefreshingMemories, getMemoryModifiedDate } = useMemories()
  const sortedMemories = [...memories].sort((a, b) => {
    const aModifiedAt = getMemoryModifiedDate(a)
    const bModifiedAt = getMemoryModifiedDate(b)
    return bModifiedAt.diff(aModifiedAt).milliseconds
  })

  const keyExtractor = useCallback((item: TMemory, index) => (item ? item.id : index.toString()), [])
  const renderListItem = useCallback(
    (listRenderItem: ListRenderItemInfo<TMemory>) => renderItem(listRenderItem.item),
    [],
  )
  const renderItem = useCallback((item: TMemory) => <MemoryCard memory={item} compact={false} />, [])

  return (
    <UI.Container>
      <FlatList<TMemory>
        data={sortedMemories}
        keyExtractor={keyExtractor}
        renderItem={renderListItem}
        onRefresh={refreshMemories}
        refreshing={isRefreshingMemories}
      />
    </UI.Container>
  )
}
