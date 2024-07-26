import { Store, Listener } from "./store";

describe("Store class", () => {
  describe("subscribe method", () => {
    it("should add a listener to the listeners array", () => {
      const store = new Store(0);
      const listener = vitest.fn() as Listener; // Mock listener function

      const unsubscribe = store.subscribe(listener);

      expect(store.listeners.size).toBe(1);
      expect(store.listeners.has(listener)).toBeTruthy();

      unsubscribe(); // Call unsubscribe to avoid memory leaks
    });
  });

  describe("unsubscribe method", () => {
    it("should remove a listener from the listeners array", () => {
      const store = new Store(0);
      const listener1 = vitest.fn() as Listener;
      const listener2 = vitest.fn() as Listener;

      store.subscribe(listener1);
      store.subscribe(listener2);

      expect(store.listeners.size).toBe(2);

      store.unsubscribe(listener1);

      expect(store.listeners.size).toBe(1);
      expect(store.listeners.has(listener1)).toBeFalsy();
      expect(store.listeners.has(listener2)).toBeTruthy();
    });

    it("should remove a listner by clean-up function", () => {
      const store = new Store(0);
      const listener1 = vitest.fn() as Listener;
      const listener2 = vitest.fn() as Listener;

      const unsub = store.subscribe(listener1);
      store.subscribe(listener2);

      expect(store.listeners.size).toBe(2);

      unsub();

      expect(store.listeners.size).toBe(1);
      expect(store.listeners.has(listener1)).toBeFalsy();
    });

    it("should not modify the array if listener is not found", () => {
      const store = new Store(0);
      const listener1 = vitest.fn() as Listener;
      const listener2 = vitest.fn() as Listener;

      store.subscribe(listener1);

      const originalSize = store.listeners.size;

      store.unsubscribe(listener2);

      expect(store.listeners.size).toBe(originalSize);
    });
  });

  describe("updateState method", () => {
    it("should update the internal state and call listeners", () => {
      const store = new Store(0);
      const listener = vitest.fn() as Listener;

      store.subscribe(listener);

      const nextState = 1;
      store.updateState(nextState);

      expect(store.state).toEqual(nextState);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should not call listener when the same value is passed", () => {
      const unchangedState = {};
      const store = new Store(unchangedState);
      const listener = vitest.fn() as Listener;

      store.subscribe(listener);

      store.updateState(unchangedState);

      expect(store.state).toEqual(unchangedState);
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it("should handle multiple updates correctly", () => {
      const store = new Store({ count: 0 });
      store.updateState({ count: 1 });
      store.updateState(({ count }) => ({ count: count + 1 }));
      expect(store.state).toEqual({ count: 2 });
    });
  });

  describe("broadcast method", () => {
    it("should call all subscribed listeners with the current state", () => {
      const store = new Store(0);
      const listener1 = vitest.fn() as Listener;
      const listener2 = vitest.fn() as Listener;

      store.subscribe(listener1);
      store.subscribe(listener2);

      store.broadcast();

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });
});
