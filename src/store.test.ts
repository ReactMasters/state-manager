import { Store, Listener, Subscription } from './store'

describe('Store class', () => {
  describe('subscribe method', () => {
    it('should add a listener to the subscription set', () => {
      const store = new Store(0)
      const listener = vitest.fn() as Listener<number> // Mock listener function

      const unsubscribe = store.subscribe(listener)

      expect(store.subscriptions.size).toBe(1)
      expect(
        Array.from(store.subscriptions.values()).some(
          ({ listener: l }) => listener === l
        )
      ).toBeTruthy()

      unsubscribe() // Call unsubscribe to avoid memory leaks
    })

    it('should add a listener with custom selector', () => {
      const store = new Store({ a: 1, b: 2 })
      const listener = vi.fn()

      store.subscribe(listener, ({ a }) => a + 3)
      store.setState(({ b }) => ({ a: 2, b }))

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(5)
    })

    it('should broadcast when values of subscribed properties has been changed', () => {
      const store = new Store({ a: 1, b: 2 })
      const listener = vi.fn()

      store.subscribe(listener, ({ a }) => a + 1)
      store.setState(({ a, b }) => ({ a, b: b + 1 }))

      expect(listener).toHaveBeenCalledTimes(0)
    })
  })

  describe('unsubscribe method', () => {
    it('should remove a listener by cleanup function', () => {
      const store = new Store(0)
      const listener1 = vitest.fn() as Listener<number>
      const listener2 = vitest.fn() as Listener<number>

      const unsubscribe1 = store.subscribe(listener1)
      store.subscribe(listener2)

      expect(store.subscriptions.size).toBe(2)

      unsubscribe1()

      expect(store.subscriptions.size).toBe(1)

      expect(
        Array.from(store.subscriptions.values()).some(
          ({ listener: l }) => listener1 === l
        )
      ).toBeFalsy()
      expect(
        Array.from(store.subscriptions.values()).some(
          ({ listener: l }) => listener2 === l
        )
      ).toBeTruthy()
    })

    it('should do nothing if subscription is not found', () => {
      const store = new Store(0)
      const listener = vitest.fn() as Listener<number>
      store.subscribe(listener)

      const originalSize = store.subscriptions.size

      const subscription: Subscription<number> = {
        listener: vitest.fn() as Listener<number>,
        selector: (v) => v,
      }

      store.unsubscribe(subscription)

      expect(store.subscriptions.size).toBe(originalSize)
    })
  })

  describe('setState method', () => {
    it('should update the internal state and call listeners', () => {
      const store = new Store(0)
      const listener = vitest.fn() as Listener<number>

      store.subscribe(listener)

      const nextState = 1
      store.setState(nextState)

      expect(store.state).toEqual(nextState)
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should update the state correctly when an object, as opposed to primitive, is given as a param', () => {
      const store = new Store({
        user: {
          name: 'originalName',
          age: 10,
        },
      })
      store.setState({
        user: {
          name: 'newUserName',
          age: 30,
        },
      })
      expect(store.state).toEqual({
        user: {
          name: 'newUserName',
          age: 30,
        },
      })
    })

    it('should not call listener when the same value is passed', () => {
      const unchangedState = { a: 1, b: '1' }
      const equalityFn = (
        v1: typeof unchangedState,
        v2: typeof unchangedState
      ) => v1.a === v2.a && v1.b === v2.b
      const store = new Store(unchangedState, equalityFn)
      const listener = vitest.fn() as Listener<typeof unchangedState>

      store.subscribe(listener)

      store.setState(unchangedState)

      expect(store.state).toEqual(unchangedState)
      expect(listener).toHaveBeenCalledTimes(0)
    })

    it('should handle multiple updates correctly', () => {
      const store = new Store({ count: 0 })
      store.setState({ count: 1 })
      store.setState(({ count }) => ({ count: count + 1 }))
      expect(store.state).toEqual({ count: 2 })
    })
  })

  describe('getState method', () => {
    it('should return the current state', () => {
      const store = new Store(0)
      expect(store.getState()).toBe(0)
    })
  })

  describe('broadcast method', () => {
    it('should call all subscribed listeners with the current state', () => {
      const store = new Store(0)
      const listener1 = vitest.fn() as Listener<number>
      const listener2 = vitest.fn() as Listener<number>

      store.subscribe(listener1)
      store.subscribe(listener2)

      store.setState(1)

      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })
  })

  describe('isUpdaterType method', () => {
    it('should return true only if the param is a function', () => {
      const store = new Store(0)
      const isUpdaterTypeDesc = Object.getOwnPropertyDescriptor(
        Store.prototype,
        'isUpdaterType'
      )?.value
      const isUpdaterType = isUpdaterTypeDesc.bind(store)
      expect(isUpdaterType(1)).toBe(false)
      expect(isUpdaterType(() => {})).toBe(true)
    })
  })
})
