import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import type { BufferId } from '../buffers/types'
import type { DocumentLine } from '../document/types'
import { useActiveLineController } from './useActiveLineController'

function createLines(count: number, actionAt?: number): DocumentLine[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `test-line-${index + 1}`,
    number: index + 1,
    searchText: `Line ${index + 1}`,
    content: <p>Line {index + 1}</p>,
    ...(index === actionAt
      ? { action: { label: 'Run action', run: vi.fn() } }
      : {}),
  }))
}

function registerRows(lines: DocumentLine[], visibleCount = lines.length) {
  const rows = lines.map((line, index) => {
    const row = document.createElement('div')
    row.dataset.editorLineId = line.id
    row.scrollIntoView = vi.fn()
    row.getBoundingClientRect = vi.fn(() => ({
      x: 0,
      y: index < visibleCount ? index * 40 : 1000,
      top: index < visibleCount ? index * 40 : 1000,
      right: 800,
      bottom: index < visibleCount ? index * 40 + 40 : 1040,
      left: 0,
      width: 800,
      height: 40,
      toJSON: () => ({}),
    }))
    document.body.append(row)
    return row
  })

  return rows
}

beforeEach(() => {
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 })
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  )
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test('moves one registered line at a time and clamps at both boundaries', () => {
  const lines = createLines(3)
  registerRows(lines)
  const { result } = renderHook(() =>
    useActiveLineController({ bufferId: 'readme', lines }),
  )

  act(() => result.current.moveLines(-1))
  expect(result.current.activeIndex).toBe(0)

  act(() => result.current.moveLines(1))
  expect(result.current.activeIndex).toBe(1)

  act(() => result.current.moveLines(10))
  expect(result.current.activeIndex).toBe(2)

  act(() => result.current.moveLines(1))
  expect(result.current.activeIndex).toBe(2)
})

test('moves half the number of currently visible registered rows', () => {
  const lines = createLines(10)
  registerRows(lines, 6)
  const { result } = renderHook(() =>
    useActiveLineController({ bufferId: 'readme', lines }),
  )

  act(() => result.current.setActiveIndex(4))
  act(() => result.current.moveHalfPage(1))
  expect(result.current.activeIndex).toBe(7)

  act(() => result.current.moveHalfPage(-1))
  expect(result.current.activeIndex).toBe(4)
})

test('moves directly to the first and last registered lines', () => {
  const lines = createLines(4)
  registerRows(lines)
  const { result } = renderHook(() =>
    useActiveLineController({ bufferId: 'readme', lines }),
  )

  act(() => result.current.moveBoundary('last'))
  expect(result.current.activeIndex).toBe(3)

  act(() => result.current.moveBoundary('first'))
  expect(result.current.activeIndex).toBe(0)
})

test('resets to the first line on buffer changes and when explicitly requested', () => {
  const firstLines = createLines(4)
  const nextLines = createLines(2)
  registerRows(firstLines)
  const { result, rerender } = renderHook(
    ({ bufferId, lines }: { bufferId: BufferId; lines: DocumentLine[] }) =>
      useActiveLineController({ bufferId, lines }),
    { initialProps: { bufferId: 'readme', lines: firstLines } },
  )

  act(() => result.current.setActiveIndex(3))
  rerender({ bufferId: 'experience', lines: nextLines })
  expect(result.current.activeIndex).toBe(0)

  act(() => result.current.setActiveIndex(1))
  act(() => result.current.resetForBuffer())
  expect(result.current.activeIndex).toBe(0)
})

test('does not restore a stale line after visiting another buffer without moving', () => {
  const firstLines = createLines(4)
  const nextLines = createLines(2)
  registerRows(firstLines)
  const { result, rerender } = renderHook(
    ({ bufferId, lines }: { bufferId: BufferId; lines: DocumentLine[] }) =>
      useActiveLineController({ bufferId, lines }),
    { initialProps: { bufferId: 'readme', lines: firstLines } },
  )

  act(() => result.current.setActiveIndex(3))
  rerender({ bufferId: 'experience', lines: nextLines })
  expect(result.current.activeIndex).toBe(0)

  rerender({ bufferId: 'readme', lines: firstLines })
  expect(result.current.activeIndex).toBe(0)
})

test('aligns only the active registered row with smooth nearest scrolling', () => {
  const lines = createLines(3)
  const rows = registerRows(lines)
  const { result } = renderHook(() =>
    useActiveLineController({ bufferId: 'readme', lines }),
  )
  vi.mocked(rows[0].scrollIntoView).mockClear()

  act(() => result.current.moveLines(1))

  expect(rows[0].scrollIntoView).not.toHaveBeenCalled()
  expect(rows[1].scrollIntoView).toHaveBeenCalledWith({
    block: 'nearest',
    behavior: 'smooth',
  })
  expect(rows[2].scrollIntoView).not.toHaveBeenCalled()
})

test('does not realign when only the lines array identity changes', () => {
  const lines = createLines(2)
  const rows = registerRows(lines)
  const { rerender } = renderHook(
    ({ currentLines }) =>
      useActiveLineController({ bufferId: 'readme', lines: currentLines }),
    { initialProps: { currentLines: lines } },
  )
  vi.mocked(rows[0].scrollIntoView).mockClear()

  rerender({ currentLines: [...lines] })

  expect(rows[0].scrollIntoView).not.toHaveBeenCalled()
})

test('uses immediate nearest scrolling when reduced motion is preferred', () => {
  vi.mocked(window.matchMedia).mockReturnValue({
    matches: true,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
  const lines = createLines(2)
  const rows = registerRows(lines)
  const { result } = renderHook(() =>
    useActiveLineController({ bufferId: 'readme', lines }),
  )
  vi.mocked(rows[0].scrollIntoView).mockClear()

  act(() => result.current.moveLines(1))

  expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  expect(rows[1].scrollIntoView).toHaveBeenCalledWith({
    block: 'nearest',
    behavior: 'auto',
  })
})

test('runs the action registered to the active line directly', () => {
  const lines = createLines(3, 1)
  registerRows(lines)
  const { result } = renderHook(() =>
    useActiveLineController({ bufferId: 'readme', lines }),
  )

  act(() => result.current.setActiveIndex(1))
  act(() => result.current.activateLine())

  expect(lines[1].action?.run).toHaveBeenCalledOnce()
})

test('keeps an empty document at index zero and treats its actions as no-ops', () => {
  const { result } = renderHook(() =>
    useActiveLineController({ bufferId: 'readme', lines: [] }),
  )

  act(() => {
    result.current.setActiveIndex(9)
    result.current.moveLines(1)
    result.current.moveHalfPage(1)
    result.current.moveBoundary('last')
    result.current.activateLine()
  })

  expect(result.current.activeIndex).toBe(0)
})
