import { State, Listener } from './state';

describe('State class', () => {
  describe('subscribe method', () => {
    it('should add a listener to the listeners array', () => {
      const state = new State();
      const listener = vitest.fn() as Listener; // Mock listener function

      const unsubscribe = state.subscribe(listener);

      expect(state.listeners.length).toBe(1);
      expect(state.listeners[0]).toBe(listener);

      unsubscribe(); // Call unsubscribe to avoid memory leaks
    });
  });

  describe('unsubscribe method', () => {
    it('should remove a listener from the listeners array', () => {
      const state = new State();
      const listener1 = vitest.fn() as Listener;
      const listener2 = vitest.fn() as Listener;

      state.subscribe(listener1);
      state.subscribe(listener2);

      expect(state.listeners.length).toBe(2);

      state.unsubscribe(listener1);

      expect(state.listeners.length).toBe(1);
      expect(state.listeners[0]).toBe(listener2);
    });

    it('should remove a listner by clean-up function', () => {
      const state = new State();
      const listener1 = vitest.fn() as Listener;
      const listener2 = vitest.fn() as Listener;

      const unsub = state.subscribe(listener1);
      state.subscribe(listener2);

      expect(state.listeners.length).toBe(2);

      unsub();

      expect(state.listeners.length).toBe(1);
      expect(state.listeners[0]).toBe(listener2);
    });

    it('should not modify the array if listener is not found', () => {
      const state = new State();
      const listener1 = vitest.fn() as Listener;
      const listener2 = vitest.fn() as Listener;

      state.subscribe(listener1);

      const originalLength = state.listeners.length;

      state.unsubscribe(listener2);

      expect(state.listeners.length).toBe(originalLength);
    });
  });
});
