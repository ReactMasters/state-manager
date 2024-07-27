export type Listener<T> = (state: T) => void;
type Selector<T, U> = (state: T) => U;
type Updater<T> = (state: T) => T;

export class Store<T extends U, U = T> {
  listeners: Map<symbol, { selector: Selector<T, U>; listener: Listener<U> }> =
    new Map();
  state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  subscribe(selector: Selector<T, U>, listener: Listener<U>) {
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

  setState(newState: U | Updater<T>) {
    const nextState = this.getNextState(this.state, newState);

    const shouldUpdate = nextState !== this.state;
    if (!shouldUpdate) return this.state;

    this.state = nextState;

    this.broadcast();
  }

  private getNextState(currentState: T, newState: U | Updater<T>): T {
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
      const selectedState = selector(this.state);
      listener(selectedState);
    }
  }
}
