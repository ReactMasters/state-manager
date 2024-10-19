import { useSyncExternalStore } from 'react'
import { Selector } from '../store' // Store 클래스를 가져올 경로 지정
import { StoreApi } from '../createStore'

/**
 * A custom hook that subscribes to a store and triggers a rerendering when the state changes.
 * You can also provide a selector to subscribe to a partial change of the state.
 * 
 * @param store - The state store implementing the `StoreApi` interface.
 * @param selector - Optional function to select a part of the store's state. Defaults to returning the entire state.
 * 
 * @returns The selected state or the entire state if no selector is provided.
 * 
 * @example
 * ```ts
 * const store = createStore(0);
 * 
 * function Component() {
 *   const count = useReactive(store);
 *   
 *   return <div>{count}</div>;
 * }
 * 
 * // With a selector
 * function SelectedComponent() {
 *   const evenCount = useReactive(store, (state) => state % 2 === 0);
 *   
 *   return <div>{evenCount ? "Even" : "Odd"}</div>;
 * }
 * ```
 */
export function useReactive<T, O = T>(
  store: StoreApi<T>,
  selector: Selector<T, O> = (state) => state as unknown as O
): O {
  return useSyncExternalStore<O>(
    // subscribe: 상태 변경되면 리렌더링을 일으킬 listener 를 받아서 핸들링, cleanup 을 반환해야함
    (listener) => store.subscribe(listener, selector),
    // getSnapshot: 현재 상태를 반환
    () => selector(store.getState()),
    // getServerSnapshot: SSR 에서 현재 상태를 반환
    () => selector(store.getState())
  )
}
