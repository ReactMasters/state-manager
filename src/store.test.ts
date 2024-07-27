import { Store, Listener } from "./store";

describe("Store class", () => {
  describe("subscribe method", () => {
    it("should add a listener to the listeners array", () => {
      const store = new Store(0);
      const listener = vitest.fn() as Listener<number>; // Mock listener function

      const unsubscribe = store.subscribe((v) => v, listener);

      expect(store.listeners.size).toBe(1);
      expect(
        Array.from(store.listeners.values()).some(
          ({ listener: l }) => listener === l
        )
      ).toBeTruthy();

      unsubscribe(); // Call unsubscribe to avoid memory leaks
    });
  });

  describe("unsubscribe method", () => {
    it("should remove a listener from the listeners array", () => {
      const store = new Store(0);
      const listener1 = vitest.fn() as Listener<number>;
      const listener2 = vitest.fn() as Listener<number>;
      const selector = (v: number) => v;

      const unsubscribe1 = store.subscribe(selector, listener1);
      store.subscribe(selector, listener2);

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

      const unsub = store.subscribe((v) => v, listener1);
      store.subscribe((v) => v, listener2);

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

      store.subscribe((v) => v, listener1);

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

      store.subscribe((v) => v, listener);

      const nextState = 1;
      store.setState(nextState);

      expect(store.state).toEqual(nextState);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should not call listener when the same value is passed", () => {
      const unchangedState = {};
      const store = new Store(unchangedState);
      const listener = vitest.fn() as Listener<typeof unchangedState>;

      store.subscribe((v) => v, listener);

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

      store.subscribe((v) => v, listener1);
      store.subscribe((v) => v, listener2);

      store.broadcast();

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });
});
