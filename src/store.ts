export type Listener<T> = (state: T) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Selector<T> = (state: T) => any;
type Updater<T> = (state: T) => T;
type EqualityFn<T> = (a: T, b: T) => boolean;

export class Store<T> {
  listeners: Map<symbol, { selector: Selector<T>; listener: Listener<T> }> =
    new Map();
  state: T;
  prevState: T;

  private equalityFn: EqualityFn<T>;

  constructor(
    initialState: T,
    equalityFn: EqualityFn<T> = (s1, s2) => Object.is(s1, s2)
  ) {
    this.state = initialState;
    this.prevState = initialState;
    this.equalityFn = equalityFn;
  }

  subscribe(listener: Listener<T>, selector: Selector<T> = (v) => v) {
    const key = Symbol();

    this.listeners.set(key, {
      selector,
      listener,
    });

    // cleanup
    return () => this.unsubscribe(key);
  }

  unsubscribe(key: symbol) {
    if (!this.listeners.has(key)) {
      return;
    }

    this.listeners.delete(key);
  }

  getState(): T {
    return this.state;
  }

  setState(newState: T | Updater<T>) {
    const nextState = this.getNextState(this.state, newState);

    const shouldUpdate = !this.equalityFn(nextState, this.state);
    if (!shouldUpdate) return this.state;

    this.prevState = this.state;
    this.state = nextState;

    this.broadcast();
  }

  private getNextState(currentState: T, newState: T | Updater<T>): T {
    if (typeof newState === "function") {
      return (newState as Updater<T>)(currentState);
    }

    const isNonNullObject = (value: unknown): value is object =>
      typeof value === "object" && value !== null;

    if (isNonNullObject(currentState) && isNonNullObject(newState)) {
      return { ...currentState, ...newState } as T;
    }

    return newState as T;
  }

  broadcast() {
    for (const { selector, listener } of this.listeners.values()) {
      const nextState = selector(this.state);

      const shouldBroadcast = !this.equalityFn(
        nextState,
        selector(this.prevState)
      );

      if (shouldBroadcast) {
        listener(nextState);
      }
    }
  }
}
