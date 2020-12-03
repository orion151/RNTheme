import AsyncStorage from '@react-native-community/async-storage'
import { configureStore } from '@reduxjs/toolkit'
import createReactotron from '@util/ReactotronConfig'
import { Action, Reducer, Store } from 'redux'
import { Epic, createEpicMiddleware } from 'redux-observable'
import { persistReducer, persistStore } from 'redux-persist'

export type Persistor = ReturnType<typeof persistStore>
// MARKER_IMPORTS
// AnyAction, AnyAction, AppState, AppServices
function createStoreWithMiddleware<AppState, AnyAction extends Action, AppServices>(
  dependencies: AppServices,
  rootEpic: Epic<AnyAction, AnyAction, AppState, AppServices>,
  rootReducer: Reducer<AppState>,
): { store: Store<AppState, AnyAction>; persistor: Persistor } {
  const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, AppState, AppServices>({
    dependencies: dependencies,
  })
  let enhancers: any[] = []
  let reactotron: any = null
  if (__DEV__) {
    reactotron = createReactotron()
    enhancers = [reactotron.createEnhancer()]
  }
  const persistConfig = {
    key: 'root',
    // if share isnt here it will try to 'save' the base64 pdf sent in the action
    blacklist: ['appLifecycle', 'auth', 'user', 'contacts', 'notification', 'memories', 'permission'],
    storage: AsyncStorage,
  }
  const persistedReducer = persistReducer(persistConfig, rootReducer)
  const store = configureStore({
    reducer: persistedReducer,
    enhancers,
    middleware: [epicMiddleware],
  })
  const persistor = persistStore(store)

  if (__DEV__ && reactotron) {
    reactotron.setReduxStore(store)
  }

  epicMiddleware.run(rootEpic)

  return { store: store as any, persistor }
}

export { createStoreWithMiddleware }
