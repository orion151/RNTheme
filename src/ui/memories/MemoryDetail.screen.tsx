import { Button } from '@components/common/Button.component'
import { CommonStyles as C } from '@components/common/common.styles'
import MemorySegment from '@components/MemorySegment.component'
import { MainSNEnum } from '@navigation/NavigationHelpers'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { MemoryDetailHooks, TSegmentWithNew } from '@ui/memories/MemoryDetail.hooks'
import { MemoryDetailStyles as UI } from '@ui/memories/MemoryDetail.styles'
import React, { useCallback } from 'react'
import { FlatList, ListRenderItem } from 'react-native'

import { MemoryStatus } from '../../API'
import { TSegment } from '../../types/TMemory'
import { TPerson } from '../../types/TPerson'

export type MemoryDetailScreenParam = {
  memoryId: string
}

export type MemoryDetailScreenRouteProp = RouteProp<
  {
    [MainSNEnum.MemoryDetailScreen]: MemoryDetailScreenParam
  },
  MainSNEnum.MemoryDetailScreen
>

export type MemoryDetailScreenNavigationProp = StackNavigationProp<
  {
    [MainSNEnum.MemoryDetailScreen]: MemoryDetailScreenParam
  },
  MainSNEnum.MemoryDetailScreen
>

interface PersonProps {
  person: TPerson
  onClickPerson: () => void
}

const PersonKeyExtractor = (person: TPerson) => person.id
const PersonSeparator = () => <C.Empty width={10} />

// @NOTE flatlist scroll gets disabled when the whole component is a touchable
// so parent button will get disabled when the list exists, and in exchange the Pills will get navigation
const Person: React.FC<PersonProps> = React.memo(
  ({ person, onClickPerson }) => {
    const { nickname } = person

    return (
      <UI.PersonItem onPress={onClickPerson}>
        <UI.PersonItemText>{nickname}</UI.PersonItemText>
      </UI.PersonItem>
    )
  },
  (a, b) => a.person.id === b.person.id && a.onClickPerson === b.onClickPerson,
)

const SegmentKeyExtractor = (segment: TSegment) => segment.id
const SegmentSeparator = () => <C.Empty height={18} />

const { useMemory } = MemoryDetailHooks

const MemoryDetailScreen: React.FC = () => {
  const {
    people,
    segments,
    toSharedWith,
    toSegmentDetail,
    toAddSegment,
    viewComments,
    numberOfNewComments,
    status,
    publishMemory,
  } = useMemory()
  const firstSegment = segments[0]

  const renderPerson: ListRenderItem<TPerson> = useCallback(({ item }) => {
    return <Person person={item} onClickPerson={toSharedWith} />
  }, [])

  const renderSegment: ListRenderItem<TSegment> = useCallback(({ item }) => {
    return <MemorySegment segment={item} onClickSegment={() => toSegmentDetail(item.id)} />
  }, [])

  return (
    <UI.Container>
      <UI.Padding>
        <UI.Label>People</UI.Label>
        <UI.PeopleContainer onPress={toSharedWith}>
          <FlatList
            data={people}
            renderItem={renderPerson}
            keyExtractor={PersonKeyExtractor}
            ItemSeparatorComponent={PersonSeparator}
            showsHorizontalScrollIndicator={false}
            horizontal
          />
          <UI.PeopleChevronRight onPress={toSharedWith}>
            <UI.ChevronRightIcon />
          </UI.PeopleChevronRight>
        </UI.PeopleContainer>
        <UI.SegmentContainer>
          {segments.length > 1 ? (
            <FlatList<TSegmentWithNew>
              data={segments}
              renderItem={renderSegment}
              keyExtractor={SegmentKeyExtractor}
              ItemSeparatorComponent={SegmentSeparator}
            />
          ) : (
            firstSegment && (
              <MemorySegment segment={firstSegment} onClickSegment={() => toSegmentDetail(firstSegment.id)} flex />
            )
          )}
        </UI.SegmentContainer>
        <C.Empty height={8} />
        {status === MemoryStatus.PUBLISHED && <Button title="Add to memory" onPress={toAddSegment} />}
        {status === MemoryStatus.DRAFT && <Button title="Publish memory" onPress={publishMemory} />}
        {status === MemoryStatus.ARCHIVED && <Button title="Unarchive" />}
        <C.Empty height={8} />
        <UI.CommentButtonWrapper>
          <UI.CommentButton icon={<UI.CommentIcon />} onPress={viewComments} />
          {numberOfNewComments > 0 && (
            <UI.BadgeWrapper>
              <UI.Badge>{numberOfNewComments}</UI.Badge>
            </UI.BadgeWrapper>
          )}
        </UI.CommentButtonWrapper>
      </UI.Padding>
    </UI.Container>
  )
}

export default MemoryDetailScreen
