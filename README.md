<p align="center">@react-masters/state-manager</p>
<p align="center">k-state library under <b>2KB</b></p>

## Getting Started

### Installation

```console
npm install @react-master/state-manager
yarn add @react-master/state-manager
pnpm add @react-master/state-manager
```

### API

```js
// Create store
const store = createStore(0 /* initial value */, (set) => {
  /* custom action api */
  return {
    increment: () => set((n) => n + 1),
    decrement: () => set((n) => n + 1),
  }
})

// Use reactive state
const App = () => {
  const count = useReactive(store)

  return (
    <>
      <button onClick={() => store.setState((n) => n + 1)}>plus</button>
      <span>{count}</span>
      <button onClick={() => store.setState((n) => n - 1)}>minus</button>

      {/* Use custom api */}
      <button onClick={() => store.increment()}>increment</button>
    </>
  )
}

// Get current state by store ref without re-render (like ref.current)
const App = () => {
  useEffect(() => {
    store.getState()
  }, [])

  // ...
}
```

## Contributors

We welcome contributions from the community! Feel free to submit pull requests or open issues to help improve the project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
