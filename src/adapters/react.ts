import { useSyncExternalStore } from 'react'
import { Selector, StateManager, Updater } from '../stateManager'; // Store 클래스를 가져올 경로 지정

type ActionMap<T> = {
  [key: string]: Updater<T>
}
type SetterMap<T, A extends ActionMap<T>> = {
  [ActionName in keyof A]: () => T | undefined;
}
export type Temp<T, A extends ActionMap<T> = ActionMap<T>> = {
  get: StateManager<T>['getState']
  set: StateManager<T>['setState'],
  subscribe: StateManager<T>['subscribe'],
  unsubscribe: StateManager<T>['unsubscribe'],
} & SetterMap<T, A>


export const createVar = <T, A extends ActionMap<T>>(initialState: T, actionMap?: A): Temp<T, A> => {
  const store = new StateManager<T>(initialState);
  const setters: SetterMap<T, A> = {} as SetterMap<T, A>;

  for (const key in actionMap) {
    const updater = actionMap[key]
    setters[key] = () => store.setState(updater);
  }

  return {
    get: store.getState.bind(store),
    set: store.setState.bind(store),
    subscribe: store.subscribe.bind(store),
    unsubscribe: store.unsubscribe.bind(store),
    ...setters
  }
}

export function useReactive<T, O = T>(
  temp: Temp<T>,
  selector: Selector<T, O> = (state) => state as unknown as O
): O {
  return useSyncExternalStore<O>(
    // subscribe: 상태 변경되면 리렌더링을 일으킬 listener 를 받아서 핸들링, cleanup 을 반환해야함
    (listener) => temp.subscribe(listener, selector),
    // getSnapshot: 현재 상태를 반환
    () => selector(temp.get()),
    // getServerSnapshot: SSR 에서 현재 상태를 반환
    () => selector(temp.get())
  )
}
