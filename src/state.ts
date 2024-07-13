export class Listener {

}

export class State {
  listeners: Listener[] = []

  subscribe(listener: Listener) {
    // listener 배열에 삽입
    this.listeners.push(listener);

    // cleanup
    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener: Listener) {
    this.listeners = this.listeners.filter((l => l !== listener))
  }
}

// export default State;