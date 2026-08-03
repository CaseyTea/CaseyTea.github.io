import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { useVimScrollMotions } from './useVimScrollMotions'

function Harness({ disabled = false }: { disabled?: boolean }) {
  useVimScrollMotions({ disabled })

  return (
    <>
      <input aria-label="Input" />
      <textarea aria-label="Textarea" />
      <select aria-label="Select">
        <option>Option</option>
      </select>
      <button type="button">Button</button>
      <a href="#destination">Link</a>
      <div contentEditable suppressContentEditableWarning data-testid="editable">
        Editable
      </div>
      <div data-testid="plain">Plain</div>
    </>
  )
}

beforeEach(() => {
  vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined)
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
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
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: 2400,
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test.each([
  ['j', 72],
  ['k', -72],
] as const)('scrolls 72 pixels for %s and consumes the handled key', (key, top) => {
  render(<Harness />)

  expect(fireEvent.keyDown(window, { key })).toBe(false)

  expect(window.scrollBy).toHaveBeenCalledWith({ behavior: 'smooth', top })
  expect(window.scrollTo).not.toHaveBeenCalled()
})

test.each([
  ['d', 400],
  ['u', -400],
] as const)('scrolls half a viewport for Control+%s', (key, top) => {
  render(<Harness />)

  expect(fireEvent.keyDown(window, { key, ctrlKey: true })).toBe(false)

  expect(window.scrollBy).toHaveBeenCalledWith({ behavior: 'smooth', top })
})

test('scrolls to the document top only when two lowercase g keys arrive within 500ms', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-03T12:00:00Z'))
  render(<Harness />)

  expect(fireEvent.keyDown(window, { key: 'g' })).toBe(true)
  expect(window.scrollTo).not.toHaveBeenCalled()

  vi.advanceTimersByTime(500)
  expect(fireEvent.keyDown(window, { key: 'g' })).toBe(false)
  expect(window.scrollTo).toHaveBeenCalledWith({ behavior: 'smooth', top: 0 })
})

test('treats a g after the 500ms sequence window as a new first key', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-03T12:00:00Z'))
  render(<Harness />)

  fireEvent.keyDown(window, { key: 'g' })
  vi.advanceTimersByTime(501)
  expect(fireEvent.keyDown(window, { key: 'g' })).toBe(true)

  expect(window.scrollTo).not.toHaveBeenCalled()
})

test('scrolls uppercase G to the bottom immediately', () => {
  render(<Harness />)

  expect(fireEvent.keyDown(window, { key: 'G' })).toBe(false)

  expect(window.scrollTo).toHaveBeenCalledWith({ behavior: 'smooth', top: 2400 })
})

test('uses immediate scrolling when reduced motion is preferred', () => {
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
  render(<Harness />)

  fireEvent.keyDown(window, { key: 'j' })

  expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  expect(window.scrollBy).toHaveBeenCalledWith({ behavior: 'auto', top: 72 })
})

test.each([
  ['Input', 'textbox'],
  ['Textarea', 'textbox'],
  ['Select', 'combobox'],
  ['Button', 'button'],
  ['Link', 'link'],
] as const)('does not scroll from the interactive %s target', (name, role) => {
  render(<Harness />)

  fireEvent.keyDown(screen.getByRole(role, { name }), { key: 'j' })

  expect(window.scrollBy).not.toHaveBeenCalled()
  expect(window.scrollTo).not.toHaveBeenCalled()
})

test('does not scroll from an editable region', () => {
  render(<Harness />)

  fireEvent.keyDown(screen.getByTestId('editable'), { key: 'j' })

  expect(window.scrollBy).not.toHaveBeenCalled()
})

test.each([
  { key: 'j', altKey: true },
  { key: 'j', ctrlKey: true },
  { key: 'j', metaKey: true },
  { key: 'j', shiftKey: true },
  { key: 'd', ctrlKey: true, shiftKey: true },
  { key: 'u', ctrlKey: true, altKey: true },
  { key: 'G', ctrlKey: true, shiftKey: true },
])('does not consume or scroll for unsupported modifier combinations', (init) => {
  render(<Harness />)

  expect(fireEvent.keyDown(window, init)).toBe(true)
  expect(window.scrollBy).not.toHaveBeenCalled()
  expect(window.scrollTo).not.toHaveBeenCalled()
})

test('leaves previously prevented events untouched', () => {
  render(<Harness />)
  const event = new KeyboardEvent('keydown', { cancelable: true, key: 'j' })
  event.preventDefault()

  window.dispatchEvent(event)

  expect(window.scrollBy).not.toHaveBeenCalled()
  expect(window.scrollTo).not.toHaveBeenCalled()
})

test('does not scroll while disabled', () => {
  render(<Harness disabled />)

  expect(fireEvent.keyDown(window, { key: 'j' })).toBe(true)
  fireEvent.keyDown(window, { key: 'G', shiftKey: true })

  expect(window.scrollBy).not.toHaveBeenCalled()
  expect(window.scrollTo).not.toHaveBeenCalled()
})

test('does not consume unsupported keys', () => {
  render(<Harness />)

  expect(fireEvent.keyDown(screen.getByTestId('plain'), { key: 'x' })).toBe(true)
  expect(window.scrollBy).not.toHaveBeenCalled()
  expect(window.scrollTo).not.toHaveBeenCalled()
})
