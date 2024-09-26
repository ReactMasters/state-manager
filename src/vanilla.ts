import { Store } from './store' // Store 클래스를 가져올 경로 지정

export const createStore = <T>(defaultValue: T): Store<T> =>
  new Store(defaultValue)
