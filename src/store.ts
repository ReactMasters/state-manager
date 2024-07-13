export type Listener = () => void;

export class Store<T> {
  listeners: Listener[] = []
  state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  subscribe(listener: Listener) {
    // listener 배열에 삽입
    this.listeners.push(listener);

    // cleanup
    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener: Listener) {
    this.listeners = this.listeners.filter((l => l !== listener))
  }

  updateState(nextState: T) {
    const shouldUpdate = nextState !== this.state
    if (!shouldUpdate) return this.state

    this.state = nextState

    this.broadcast()
  }

  broadcast() {
    this.listeners.forEach(l => l())
  }
}