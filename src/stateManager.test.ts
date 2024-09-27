import { StateManager, Listener, Subscription } from './stateManager'

describe('StateManager class', () => {
  describe('subscribe method', () => {
    it('should add a listener to the subscription set', () => {
      const stateManager = new StateManager(0)
      const listener = vitest.fn() as Listener<number> // Mock listener function

      const unsubscribe = stateManager.subscribe(listener)

      expect(stateManager.subscriptions.size).toBe(1)
      expect(
        Array.from(stateManager.subscriptions.values()).some(
          ({ listener: l }) => listener === l
        )
      ).toBeTruthy()

      unsubscribe() // Call unsubscribe to avoid memory leaks
    })

    it('should add a listener with custom selector', () => {
      const stateManager = new StateManager({ a: 1, b: 2 })
      const listener = vi.fn()

      stateManager.subscribe(listener, ({ a }) => a + 3)
      stateManager.setState(({ b }) => ({ a: 2, b }))

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(5)
    })

    it('should broadcast when values of subscribed properties has been changed', () => {
      const stateManager = new StateManager({ a: 1, b: 2 })
      const listener = vi.fn()

      stateManager.subscribe(listener, ({ a }) => a + 1)
      stateManager.setState(({ a, b }) => ({ a, b: b + 1 }))

      expect(listener).toHaveBeenCalledTimes(0)
    })
  })

  describe('unsubscribe method', () => {
    it('should remove a listener by cleanup function', () => {
      const stateManager = new StateManager(0)
      const listener1 = vitest.fn() as Listener<number>
      const listener2 = vitest.fn() as Listener<number>

      const unsubscribe1 = stateManager.subscribe(listener1)
      stateManager.subscribe(listener2)

      expect(stateManager.subscriptions.size).toBe(2)

      unsubscribe1()

      expect(stateManager.subscriptions.size).toBe(1)

      expect(
        Array.from(stateManager.subscriptions.values()).some(
          ({ listener: l }) => listener1 === l
        )
      ).toBeFalsy()
      expect(
        Array.from(stateManager.subscriptions.values()).some(
          ({ listener: l }) => listener2 === l
        )
      ).toBeTruthy()
    })

    it('should do nothing if subscription is not found', () => {
      const stateManager = new StateManager(0)
      const listener = vitest.fn() as Listener<number>
      stateManager.subscribe(listener)

      const originalSize = stateManager.subscriptions.size

      const subscription: Subscription<number> = {
        listener: vitest.fn() as Listener<number>,
        selector: (v) => v,
      }

      stateManager.unsubscribe(subscription)

      expect(stateManager.subscriptions.size).toBe(originalSize)
    })
  })

  describe('setState method', () => {
    it('should update the internal state and call listeners', () => {
      const stateManager = new StateManager(0)
      const listener = vitest.fn() as Listener<number>

      stateManager.subscribe(listener)

      const nextState = 1
      stateManager.setState(nextState)

      expect(stateManager.state).toEqual(nextState)
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it("should update the state correctly when an object, as opposed to primitive, is given as a param", ()=>{
      const stateManager = new StateManager({user: {
        name: 'originalName',
        age: 10
      }});
      stateManager.setState({
        user: {
          name: 'newUserName',
          age: 30
        }
      })
      expect(stateManager.state).toEqual({
        user: {
          name: 'newUserName',
          age: 30
        }
      })
    })

    it('should not call listener when the same value is passed', () => {
      const unchangedState = { a: 1, b: '1' }
      const equalityFn = (
        v1: typeof unchangedState,
        v2: typeof unchangedState
      ) => v1.a === v2.a && v1.b === v2.b
      const stateManager = new StateManager(unchangedState, equalityFn)
      const listener = vitest.fn() as Listener<typeof unchangedState>

      stateManager.subscribe(listener)

      stateManager.setState(unchangedState)

      expect(stateManager.state).toEqual(unchangedState)
      expect(listener).toHaveBeenCalledTimes(0)
    })

    it('should handle multiple updates correctly', () => {
      const stateManager = new StateManager({ count: 0 })
      stateManager.setState({ count: 1 })
      stateManager.setState(({ count }) => ({ count: count + 1 }))
      expect(stateManager.state).toEqual({ count: 2 })
    })
  })

  describe('getState method', () => {
    it('should return the current state', () => {
      const stateManager = new StateManager(0)
      expect(stateManager.getState()).toBe(0)
    })
  })

  describe('broadcast method', () => {
    it('should call all subscribed listeners with the current state', () => {
      const stateManager = new StateManager(0)
      const listener1 = vitest.fn() as Listener<number>
      const listener2 = vitest.fn() as Listener<number>

      stateManager.subscribe(listener1)
      stateManager.subscribe(listener2)

      stateManager.setState(1)

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe("isUpdaterType method", () => {
    it("should return true only if the param is a function", () => {
      const stateManager = new StateManager(0);
      const isUpdaterTypeDesc = Object.getOwnPropertyDescriptor(StateManager.prototype, "isUpdaterType")?.value;
      const isUpdaterType = isUpdaterTypeDesc.bind(stateManager);
      expect(isUpdaterType(1)).toBe(false);
      expect(isUpdaterType(() => { })).toBe(true);
    })
  })
});
