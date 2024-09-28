import { useSyncExternalStore } from 'react'
import { Selector } from '../store' // Store 클래스를 가져올 경로 지정
import { StoreApi } from '../vanilla'

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
