import { render, screen, fireEvent } from '@testing-library/react'
import { createStore, useReactive } from './react'
import { Mock } from 'vitest'
import { Store } from '../store'

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
          <button onClick={() => store.setState(count + 1)}>Increment</button>
        </div>
      )
    }

    NonReactiveComponent = () => {
      const count = store.getState()

      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={() => store.setState(count + 1)}>Increment</button>
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
          <button onClick={() => store.setState((n) => n + 1)}>
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
