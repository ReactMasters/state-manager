import { render, screen, fireEvent } from '@testing-library/react'
import { createStore, Store, useReactive } from './react'
import { Mock } from 'vitest'

describe('createStore & useReactive API', () => {
  let store: Store<number>
  let ReactiveComponent: () => JSX.Element
  let NonReactiveComponent: () => JSX.Element
  let SelectorComponent: () => JSX.Element
  let onSelectRender: Mock

  beforeEach(() => {
    store = createStore(0)

    ReactiveComponent = () => {
      const count = useReactive(store)

      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={() => store.set(count + 1)}>Increment</button>
        </div>
      )
    }

    NonReactiveComponent = () => {
      const count = store.get()

      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={() => store.set(count + 1)}>Increment</button>
        </div>
      )
    }

    onSelectRender = vitest.fn()

    SelectorComponent = () => {
      const isUnder3 = useReactive(store, (n) => n < 3)
      onSelectRender()

      return (
        <div>
          <p>{isUnder3 ? 'Small' : 'Big'}</p>
          <button onClick={() => store.set((n) => n + 1)}>
            Increment
          </button>
        </div>
      )
    }
  })

  it('should render with initial state', () => {
    render(<ReactiveComponent />)

    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('should increment the count when button is clicked', () => {
    render(<ReactiveComponent />)

    const button = screen.getByText('Increment')
    expect(screen.getByText('Count: 0')).toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByText('Count: 1')).toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByText('Count: 2')).toBeInTheDocument()
  })

  it('should not re-render when not use reactive hook', () => {
    render(<NonReactiveComponent />)

    const button = screen.getByText('Increment')

    expect(screen.getByText('Count: 0')).toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByText('Count: 0')).toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('should not re-render when selected value unchanged', () => {
    render(<SelectorComponent />)

    const button = screen.getByText('Increment')
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(onSelectRender).toHaveBeenCalledTimes(1)

    fireEvent.click(button)
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(onSelectRender).toHaveBeenCalledTimes(1)

    fireEvent.click(button)
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(onSelectRender).toHaveBeenCalledTimes(1)

    fireEvent.click(button)
    expect(screen.getByText('Big')).toBeInTheDocument()
    expect(onSelectRender).toHaveBeenCalledTimes(2)
  })
})

describe('createStore actions', ()=>{
  it('should expose given actions', ()=>{
    const countStore = createStore(0, {
      increment: count => count + 1,
      decrement: count => count - 1
    })
    expect(typeof countStore.decrement).toBe('function');
    expect(typeof countStore.increment).toBe('function');
  })
  it('should update state correctly through given actions', ()=>{
    const countStore = createStore(0, {
      increment: count => count + 1,
      decrement: count => count - 1
    })
    countStore.increment();
    expect(countStore.get()).toBe(1)
    countStore.decrement();
    expect(countStore.get()).toBe(0)
  })
})