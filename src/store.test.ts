import { Store, Listener } from "./store";

describe("Store class", () => {
  describe("subscribe method", () => {
    it("should add a listener to the listeners array", () => {
      const store = new Store(0);
      const listener = vitest.fn() as Listener<number>; // Mock listener function

      const unsubscribe = store.subscribe(listener);

      expect(store.listeners.size).toBe(1);
      expect(
        Array.from(store.listeners.values()).some(
          ({ listener: l }) => listener === l
        )
      ).toBeTruthy();

      unsubscribe(); // Call unsubscribe to avoid memory leaks
    });

    it("should add a listener with custom selector", () => {
      const store = new Store({ a: 1, b: 2 });
      const listener = vi.fn();

      store.subscribe(listener, ({ a }) => a + 3);
      store.setState(({ b }) => ({ a: 2, b }));

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(5);
    });

    it("should broadcast when values of subscribed properties has been changed", () => {
      const store = new Store({ a: 1, b: 2 });
      const listener = vi.fn();

      store.subscribe(listener, ({ a }) => a + 1);
      store.setState(({ a, b }) => ({ a, b: b + 1 }));

      expect(listener).toHaveBeenCalledTimes(0);
    });
  });

  describe("unsubscribe method", () => {
    it("should remove a listener from the listeners array", () => {
      const store = new Store(0);
      const listener1 = vitest.fn() as Listener<number>;
      const listener2 = vitest.fn() as Listener<number>;

      const unsubscribe1 = store.subscribe(listener1);
      store.subscribe(listener2);

      expect(store.listeners.size).toBe(2);

      unsubscribe1();

      expect(store.listeners.size).toBe(1);

      expect(
        Array.from(store.listeners.values()).some(
          ({ listener: l }) => listener1 === l
        )
      ).toBeFalsy();
      expect(
        Array.from(store.listeners.values()).some(
          ({ listener: l }) => listener2 === l
        )
      ).toBeTruthy();
    });

    it("should remove a listner by clean-up function", () => {
      const store = new Store(0);
      const listener1 = vitest.fn() as Listener<number>;
      const listener2 = vitest.fn() as Listener<number>;

      const unsub = store.subscribe(listener1);
      store.subscribe(listener2);

      expect(store.listeners.size).toBe(2);

      unsub();

      expect(store.listeners.size).toBe(1);
      expect(
        Array.from(store.listeners.values()).some(
          ({ listener: l }) => listener1 === l
        )
      ).toBeFalsy();
    });

    it("should not modify the array if listener is not found", () => {
      const store = new Store(0);
      const listener1 = vitest.fn() as Listener<number>;

      store.subscribe(listener1);

      const originalSize = store.listeners.size;

      const nonExistentKey = Symbol();
      store.unsubscribe(nonExistentKey);

      expect(store.listeners.size).toBe(originalSize);
    });
  });

  describe("setState method", () => {
    it("should update the internal state and call listeners", () => {
      const store = new Store(0);
      const listener = vitest.fn() as Listener<number>;

      store.subscribe(listener);

      const nextState = 1;
      store.setState(nextState);

      expect(store.state).toEqual(nextState);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should not call listener when the same value is passed", () => {
      const unchangedState = { a: 1, b: "1" };
      const equalityFn = (
        v1: typeof unchangedState,
        v2: typeof unchangedState
      ) => v1.a === v2.a && v1.b === v2.b;
      const store = new Store(unchangedState, equalityFn);
      const listener = vitest.fn() as Listener<typeof unchangedState>;

      store.subscribe(listener);

      store.setState(unchangedState);

      expect(store.state).toEqual(unchangedState);
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it("should handle multiple updates correctly", () => {
      const store = new Store({ count: 0 });
      store.setState({ count: 1 });
      store.setState(({ count }) => ({ count: count + 1 }));
      expect(store.state).toEqual({ count: 2 });
    });
  });

  describe("getState method", () => {
    it("should return the current state", () => {
      const store = new Store(0);
      expect(store.getState()).toBe(0);
    });
  });

  describe("broadcast method", () => {
    it("should call all subscribed listeners with the current state", () => {
      const store = new Store(0);
      const listener1 = vitest.fn() as Listener<number>;
      const listener2 = vitest.fn() as Listener<number>;

      store.subscribe(listener1);
      store.subscribe(listener2);

      store.setState(1);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe("isUpdaterType method", () => {
    it("should return true only if the param is a function", () => {
      const store = new Store(0);
      const isUpdaterTypeDesc = Object.getOwnPropertyDescriptor(Store.prototype, "isUpdaterType")?.value;
      const isUpdaterType = isUpdaterTypeDesc.bind(store);
      expect(isUpdaterType(1)).toBe(false);
      expect(isUpdaterType(() => { })).toBe(true);
    })
  })

  describe("getNextState method", () => {
    it("should call newState method and return a new state", () => {
      const store = new Store<{ count: number }>({
        count: 1
      });
      const getNextStateDesc = Object.getOwnPropertyDescriptor(Store.prototype, "getNextState")?.value;
      const getNextState = getNextStateDesc.bind(store);
      const newState = vitest.fn((oldState: { count: number }) => {
        return {
          count: oldState.count * 2
        }
      })
      expect(getNextState(store.state, newState)).toEqual({
        count: 2
      })
      expect(newState).toHaveBeenCalled();
    })

    it("should return newState if currentState or newState is null", () => {
      const store = new Store<{ count: number }>({
        count: 1
      });
      const getNextStateDesc = Object.getOwnPropertyDescriptor(Store.prototype, "getNextState")?.value;
      const getNextState = getNextStateDesc.bind(store);
      expect(getNextState(store.state, null)).toBeNull();

      const newState = {}
      expect(getNextState(null, newState)).toBe(newState)
    })

    it("should return a merged object", () => {
      const store = new Store<{ age: number }>({
        age: 1,
      });
      const getNextStateDesc = Object.getOwnPropertyDescriptor(Store.prototype, "getNextState")?.value;
      const getNextState = getNextStateDesc.bind(store);
      expect(getNextState(store.state, { name: 'name' })).toEqual({
        age: 1,
        name: 'name'
      })
    })
  })
});
