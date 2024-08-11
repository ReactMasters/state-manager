import { useSyncExternalStore } from 'react'
import { Selector, Store, Updater } from '../store' // Store 클래스를 가져올 경로 지정

export interface StateManager<T> {
  store: Store<T>
  get: () => T
  set: (newState: T | Updater<T>) => void
}

export const createStateManager = <T>(defaultValue: T): StateManager<T> => {
  const store = new Store(defaultValue)
  return {
    store: store,
    get: () => store.getState(),
    set: (newState: T | Updater<T>) => store.setState(newState),
  }
}

export function useReactive<T, O = T>(
  stateManager: StateManager<T>,
  selector: Selector<T, O> = (count) => count as unknown as O
): O {
  return useSyncExternalStore<O>(
    // subscribe: 상태 변경되면 리렌더링을 일으킬 listener 를 받아서 핸들링
    (listener) => stateManager.store.subscribe(listener, selector),
    // getSnapshot: 현재 상태를 반환
    () => selector(stateManager.get()),
    // getServerSnapshot: SSR 에서 현재 상태를 반환
    () => selector(stateManager.get())
  )
}
