export type Listener = () => void;

export class Store<T> {
  listeners: Set<Listener> = new Set();
  state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  subscribe(listener: Listener) {
    // listener 배열에 삽입
    this.listeners.add(listener);

    // cleanup
    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener: Listener) {
    this.listeners.delete(listener);
  }

  updateState(nextState: T) {
    const shouldUpdate = nextState !== this.state;
    if (!shouldUpdate) return this.state;

    this.state = nextState;

    this.broadcast();
  }

  broadcast() {
    this.listeners.forEach((l) => l());
  }
}
