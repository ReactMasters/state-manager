import { Store, Updater } from './store'

type SetState<T> = (partial: T | ((prevState: T) => T)) => void

export interface StoreApi<T> {
  getState: () => T
  setState: SetState<T>
  subscribe: Store<T>['subscribe']
}

type Action<T> = (set: SetState<T>) => Record<string, (prevState: T) => void>
type InferActions<T, A> = A extends (set: SetState<T>) => infer U ? U : never

export const createStore = <T, A extends Action<T> | undefined>(
  initialValue: T,
  actions?: A
): A extends Action<T> ? StoreApi<T> & InferActions<T, A> : StoreApi<T> => {
  const store = new Store(initialValue)

  const baseStore: StoreApi<T> = {
    getState: () => store.getState(),
    setState: (newState: T | Updater<T>) => store.setState(newState),
    subscribe: store.subscribe.bind(store),
  }

  if (actions) {
    return {
      ...baseStore,
      ...actions(baseStore.setState),
    } as A extends Action<T> ? StoreApi<T> & InferActions<T, A> : StoreApi<T>
  }

  return baseStore as A extends Action<T>
    ? StoreApi<T> & InferActions<T, A>
    : StoreApi<T>
}
