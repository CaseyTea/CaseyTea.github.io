import { act, renderHook } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import type { BufferId } from '../buffers/types'
import type { DocumentLine } from '../document/types'
import { useBufferSearch } from './useBufferSearch'

function createLines(...searchText: string[]): DocumentLine[] {
  return searchText.map((text, index) => ({
    id: `line-${index + 1}`,
    number: index + 1,
    searchText: text,
    content: <p>{text}</p>,
  }))
}

afterEach(() => {
  vi.restoreAllMocks()
})

test('matches line search text case-insensitively after trimming outer whitespace', () => {
  const setActiveIndex = vi.fn()
  const { result } = renderHook(() => useBufferSearch({
    bufferId: 'readme',
    lines: createLines('Casey Franceschy', 'Quality Engineer', 'CASEY portfolio'),
    activeIndex: 1,
    setActiveIndex,
  }))

  act(() => {
    result.current.open()
    result.current.setQuery('  casey  ')
  })

  expect(result.current.matchIndexes).toEqual([0, 2])
  expect(result.current.currentMatch).toBe(0)
  expect(setActiveIndex).toHaveBeenLastCalledWith(0)
})

test('treats a whitespace-only query as empty without moving the cursor', () => {
  const setActiveIndex = vi.fn()
  const onStatusMessage = vi.fn()
  const { result } = renderHook(() => useBufferSearch({
    bufferId: 'readme',
    lines: createLines('One', 'Two'),
    activeIndex: 1,
    setActiveIndex,
    onStatusMessage,
  }))

  act(() => result.current.setQuery('   '))

  expect(result.current.matchIndexes).toEqual([])
  expect(result.current.currentMatch).toBeNull()
  expect(setActiveIndex).not.toHaveBeenCalled()
  expect(onStatusMessage).toHaveBeenLastCalledWith(null)
})

test('moves forward and backward through matches with wraparound', () => {
  const setActiveIndex = vi.fn()
  const { result } = renderHook(() => useBufferSearch({
    bufferId: 'readme',
    lines: createLines('Match one', 'No result', 'Match two'),
    activeIndex: 1,
    setActiveIndex,
  }))

  act(() => result.current.setQuery('match'))
  expect(result.current.currentMatch).toBe(0)

  act(() => result.current.next())
  expect(result.current.currentMatch).toBe(1)
  expect(setActiveIndex).toHaveBeenLastCalledWith(2)

  act(() => result.current.next())
  expect(result.current.currentMatch).toBe(0)
  expect(setActiveIndex).toHaveBeenLastCalledWith(0)

  act(() => result.current.previous())
  expect(result.current.currentMatch).toBe(1)
  expect(setActiveIndex).toHaveBeenLastCalledWith(2)
})

test('resets traversal to the first match whenever the query changes', () => {
  const setActiveIndex = vi.fn()
  const { result } = renderHook(() => useBufferSearch({
    bufferId: 'readme',
    lines: createLines('Alpha beta', 'Beta', 'Alpha'),
    activeIndex: 0,
    setActiveIndex,
  }))

  act(() => result.current.setQuery('alpha'))
  act(() => result.current.next())
  expect(result.current.currentMatch).toBe(1)

  act(() => result.current.setQuery('beta'))

  expect(result.current.matchIndexes).toEqual([0, 1])
  expect(result.current.currentMatch).toBe(0)
  expect(setActiveIndex).toHaveBeenLastCalledWith(0)
})

test('reports a non-empty missing pattern without moving the cursor', () => {
  const setActiveIndex = vi.fn()
  const onStatusMessage = vi.fn()
  const { result } = renderHook(() => useBufferSearch({
    bufferId: 'readme',
    lines: createLines('Alpha', 'Beta'),
    activeIndex: 1,
    setActiveIndex,
    onStatusMessage,
  }))

  act(() => result.current.setQuery('gamma'))

  expect(result.current.matchIndexes).toEqual([])
  expect(result.current.currentMatch).toBeNull()
  expect(setActiveIndex).not.toHaveBeenCalled()
  expect(onStatusMessage).toHaveBeenLastCalledWith('pattern not found: gamma')

  act(() => {
    result.current.next()
    result.current.previous()
  })
  expect(setActiveIndex).not.toHaveBeenCalled()
})

test('resets an open search when the active buffer changes', () => {
  const setActiveIndex = vi.fn()
  type HookProps = { bufferId: BufferId; lines: DocumentLine[] }
  const { result, rerender } = renderHook(
    ({ bufferId, lines }: HookProps) => useBufferSearch({
      bufferId,
      lines,
      activeIndex: 2,
      setActiveIndex,
    }),
    {
      initialProps: {
        bufferId: 'readme',
        lines: createLines('Match', 'Other', 'Match again'),
      } as HookProps,
    },
  )

  act(() => {
    result.current.open()
    result.current.setQuery('match')
  })
  setActiveIndex.mockClear()

  rerender({ bufferId: 'experience', lines: createLines('Experience') })

  expect(result.current.isOpen).toBe(false)
  expect(result.current.query).toBe('')
  expect(result.current.matchIndexes).toEqual([])
  expect(result.current.currentMatch).toBeNull()
  expect(setActiveIndex).not.toHaveBeenCalled()
})

test('closing restores the invoking logical line and focused element', () => {
  const trigger = document.createElement('button')
  document.body.append(trigger)
  trigger.focus()
  const focus = vi.spyOn(trigger, 'focus')
  const setActiveIndex = vi.fn()
  const { result } = renderHook(() => useBufferSearch({
    bufferId: 'readme',
    lines: createLines('Match', 'Other', 'Final'),
    activeIndex: 2,
    setActiveIndex,
  }))

  act(() => result.current.open())
  const searchInput = document.createElement('input')
  document.body.append(searchInput)
  searchInput.focus()
  act(() => result.current.setQuery('match'))
  setActiveIndex.mockClear()

  act(() => result.current.close())

  expect(result.current.isOpen).toBe(false)
  expect(result.current.query).toBe('')
  expect(setActiveIndex).toHaveBeenCalledWith(2)
  expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  expect(trigger).toHaveFocus()

  trigger.remove()
  searchInput.remove()
})
