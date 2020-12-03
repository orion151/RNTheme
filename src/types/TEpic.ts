import { AnyAction } from 'redux'
import { Epic } from 'redux-observable'

import { AppServices } from '../redux/AppServices'
import { AppState } from '../redux/AppState'

export type TEpic = Epic<AnyAction, AnyAction, AppState, AppServices>
