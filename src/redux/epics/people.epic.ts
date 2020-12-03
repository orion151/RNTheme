import { TEpic } from '@redux/RootEpic'
import { AnyAction } from 'redux'
import { concatAll, filter, switchMap } from 'rxjs/operators'

import { TPerson } from '../../types/TPerson'
import { memoriesActions } from '../slices/memories.slice'
import { peopleActions } from '../slices/people.slice'

const e: TEpic[] = []

e[e.length] = (action$, _state$, _services) =>
  action$.pipe(
    filter(memoriesActions.setMemories.match),
    switchMap(
      async ({ payload }): Promise<AnyAction[]> => {
        const newPeople = payload.flatMap((m) => [m.person, ...m.people])
        const entries = newPeople.map((p) => [p.id, p])
        const mapOfPeople: Record<string, TPerson> = Object.fromEntries(entries)

        return [peopleActions.mergePeople(mapOfPeople)]
      },
    ),
    concatAll(),
  )

export const peopleEpics = e
