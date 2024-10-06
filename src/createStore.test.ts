import { describe, it, expect } from 'vitest'
import { createStore } from './createStore'

describe('createStore', () => {
  it('creates a store with initial value', () => {
    const initialValue = 0
    const store = createStore(initialValue)

    expect(store.getState()).toEqual(initialValue)
  })

  it('updates store state using setState', () => {
    const store = createStore(0)

    store.setState(1)
    expect(store.getState()).toEqual(1)

    store.setState((prev) => prev + 1)
    expect(store.getState()).toEqual(2)
  })

  it('subscribes to store changes', () => {
    const store = createStore(0)
    const mockListener = vi.fn()

    store.subscribe(mockListener)
    store.setState((prev) => prev + 1)

    expect(mockListener).toHaveBeenCalledWith(1)
  })

  it('creates a store with actions', () => {
    const initialValue = 0

    const store = createStore(initialValue, (set) => ({
      increment: () => set((prev) => prev + 1),
      decrement: () => set((prev) => prev - 1),
      reset: () => set(initialValue),
    }))

    expect(store.getState()).toEqual(initialValue)
    expect(typeof store.increment).toBe('function')
    expect(typeof store.decrement).toBe('function')

    store.increment()
    expect(store.getState()).toEqual(1)

    store.decrement()
    expect(store.getState()).toEqual(0)
  })
})
