import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { useVimInterpreter, type VimInterpreterOptions } from './useVimInterpreter'

type InterpreterCallbacks = Pick<
  VimInterpreterOptions,
  | 'moveLines'
  | 'moveHalfPage'
  | 'moveBoundary'
  | 'activateLine'
  | 'cycleBuffer'
  | 'openPrimaryBuffer'
  | 'onEasterEgg'
  | 'onOpenSearch'
  | 'onOpenCommand'
>

function createCallbacks(): InterpreterCallbacks {
  return {
    moveLines: vi.fn(),
    moveHalfPage: vi.fn(),
    moveBoundary: vi.fn(),
    activateLine: vi.fn(),
    cycleBuffer: vi.fn(),
    openPrimaryBuffer: vi.fn(),
    onEasterEgg: vi.fn(),
    onOpenSearch: vi.fn(),
    onOpenCommand: vi.fn(),
  }
}

function Harness({
  callbacks,
  vimEnabled = true,
  isCommandOpen = false,
  isSearchOpen = false,
}: {
  callbacks: InterpreterCallbacks
  vimEnabled?: boolean
  isCommandOpen?: boolean
  isSearchOpen?: boolean
}) {
  useVimInterpreter({
    ...callbacks,
    vimEnabled,
    isCommandOpen,
    isSearchOpen,
  })

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
      <details>
        <summary>Summary</summary>
        Details
      </details>
      <audio controls data-testid="audio" />
      <video controls data-testid="video" />
      <div tabIndex={0} data-testid="tab-stop">Tab stop</div>
      <main id="active-buffer" tabIndex={0} data-testid="document-root">
        <span data-testid="plain-line">Plain line</span>
      </main>
    </>
  )
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

test.each([
  ['j', 1],
  ['k', -1],
] as const)('delegates %s as a one-line motion and consumes it', (key, delta) => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key })).toBe(false)

  expect(callbacks.moveLines).toHaveBeenCalledWith(delta)
})

test.each([
  ['d', 1],
  ['u', -1],
] as const)('delegates Control+%s as a half-page motion', (key, direction) => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key, ctrlKey: true })).toBe(false)

  expect(callbacks.moveHalfPage).toHaveBeenCalledWith(direction)
})

test('moves to the first line only when lowercase gg completes within an inclusive 500ms', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-03T12:00:00Z'))
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key: 'g' })).toBe(true)
  vi.advanceTimersByTime(500)
  expect(fireEvent.keyDown(window, { key: 'g' })).toBe(false)

  expect(callbacks.moveBoundary).toHaveBeenCalledWith('first')
})

test('treats g after 500ms as a new pending sequence', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-03T12:00:00Z'))
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  fireEvent.keyDown(window, { key: 'g' })
  vi.advanceTimersByTime(501)
  expect(fireEvent.keyDown(window, { key: 'g' })).toBe(true)

  expect(callbacks.moveBoundary).not.toHaveBeenCalled()
})

test('moves uppercase G directly to the final registered line', () => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key: 'G', shiftKey: true })).toBe(false)

  expect(callbacks.moveBoundary).toHaveBeenCalledWith('last')
})

test.each([
  ['t', false, 1],
  ['T', true, -1],
] as const)('delegates g%s to open-buffer cycling', (key, shiftKey, direction) => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key: 'g' })).toBe(true)
  expect(fireEvent.keyDown(window, { key, shiftKey })).toBe(false)

  expect(callbacks.cycleBuffer).toHaveBeenCalledWith(direction)
})

test.each([1, 4, 7])('opens documented primary buffer %s', (position) => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key: String(position) })).toBe(false)

  expect(callbacks.openPrimaryBuffer).toHaveBeenCalledWith(position)
})

test('leaves numbers outside the documented primary mapping untouched', () => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key: '8' })).toBe(true)

  expect(callbacks.openPrimaryBuffer).not.toHaveBeenCalled()
})

test('activates the current line with Enter', () => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key: 'Enter' })).toBe(false)

  expect(callbacks.activateLine).toHaveBeenCalledOnce()
})

test('delegates ZZ only when the second key arrives within 500ms', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-03T12:00:00Z'))
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key: 'Z', shiftKey: true })).toBe(true)
  vi.advanceTimersByTime(500)
  expect(fireEvent.keyDown(window, { key: 'Z', shiftKey: true })).toBe(false)

  expect(callbacks.onEasterEgg).toHaveBeenCalledWith('ZZ')
})

test('treats uppercase Z after 500ms as a new pending sequence', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-03T12:00:00Z'))
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  fireEvent.keyDown(window, { key: 'Z', shiftKey: true })
  vi.advanceTimersByTime(501)
  expect(fireEvent.keyDown(window, { key: 'Z', shiftKey: true })).toBe(true)

  expect(callbacks.onEasterEgg).not.toHaveBeenCalled()
})

test('delegates i as the read-only insert easter egg', () => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key: 'i' })).toBe(false)

  expect(callbacks.onEasterEgg).toHaveBeenCalledWith('i')
})

test('delegates command and search opening only when callbacks are provided', () => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key: '/' })).toBe(false)
  expect(fireEvent.keyDown(window, { key: ':', shiftKey: true })).toBe(false)

  expect(callbacks.onOpenSearch).toHaveBeenCalledOnce()
  expect(callbacks.onOpenCommand).toHaveBeenCalledOnce()
})

test('leaves command and search keys untouched when their feature callbacks are absent', () => {
  const callbacks = createCallbacks()
  callbacks.onOpenSearch = undefined
  callbacks.onOpenCommand = undefined
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key: '/' })).toBe(true)
  expect(fireEvent.keyDown(window, { key: ':', shiftKey: true })).toBe(true)
})

test.each([
  { key: 'j', altKey: true },
  { key: 'j', ctrlKey: true },
  { key: 'j', metaKey: true },
  { key: 'j', shiftKey: true },
  { key: 'd', ctrlKey: true, shiftKey: true },
  { key: 'u', ctrlKey: true, altKey: true },
  { key: 'G', ctrlKey: true, shiftKey: true },
  { key: '1', metaKey: true },
  { key: 'Enter', shiftKey: true },
  { key: 'I', shiftKey: true },
])('leaves unsupported modifier combinations untouched', (init) => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, init)).toBe(true)
  expect(callbacks.moveLines).not.toHaveBeenCalled()
  expect(callbacks.moveHalfPage).not.toHaveBeenCalled()
  expect(callbacks.moveBoundary).not.toHaveBeenCalled()
  expect(callbacks.activateLine).not.toHaveBeenCalled()
  expect(callbacks.openPrimaryBuffer).not.toHaveBeenCalled()
  expect(callbacks.onEasterEgg).not.toHaveBeenCalled()
})

test('allows held line motions but never lets a repeated g or Z complete a sequence', () => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(window, { key: 'j', repeat: true })).toBe(false)
  expect(callbacks.moveLines).toHaveBeenCalledWith(1)

  fireEvent.keyDown(window, { key: 'g' })
  expect(fireEvent.keyDown(window, { key: 'g', repeat: true })).toBe(true)
  expect(callbacks.moveBoundary).not.toHaveBeenCalled()

  fireEvent.keyDown(window, { key: 'Z', shiftKey: true })
  expect(fireEvent.keyDown(window, { key: 'Z', shiftKey: true, repeat: true })).toBe(true)
  expect(callbacks.onEasterEgg).not.toHaveBeenCalled()
})

test('leaves previously prevented events untouched and clears pending sequences', () => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)
  fireEvent.keyDown(window, { key: 'g' })
  const preventedEvent = new KeyboardEvent('keydown', { cancelable: true, key: 'j' })
  preventedEvent.preventDefault()

  window.dispatchEvent(preventedEvent)
  expect(fireEvent.keyDown(window, { key: 'g' })).toBe(true)

  expect(callbacks.moveLines).not.toHaveBeenCalled()
  expect(callbacks.moveBoundary).not.toHaveBeenCalled()
})

test.each([
  { vimEnabled: false, isCommandOpen: false, isSearchOpen: false },
  { vimEnabled: true, isCommandOpen: true, isSearchOpen: false },
  { vimEnabled: true, isCommandOpen: false, isSearchOpen: true },
])('leaves every key untouched when editor shortcuts are unavailable', (state) => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} {...state} />)

  expect(fireEvent.keyDown(window, { key: 'j' })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'Enter' })).toBe(true)
  expect(callbacks.moveLines).not.toHaveBeenCalled()
  expect(callbacks.activateLine).not.toHaveBeenCalled()
})

test.each([
  ['Input', () => screen.getByRole('textbox', { name: 'Input' })],
  ['Textarea', () => screen.getByRole('textbox', { name: 'Textarea' })],
  ['Select', () => screen.getByRole('combobox', { name: 'Select' })],
  ['Button', () => screen.getByRole('button', { name: 'Button' })],
  ['Link', () => screen.getByRole('link', { name: 'Link' })],
  ['Editable', () => screen.getByTestId('editable')],
  ['Summary', () => screen.getByText('Summary')],
  ['Audio controls', () => screen.getByTestId('audio')],
  ['Video controls', () => screen.getByTestId('video')],
  ['Tab stop', () => screen.getByTestId('tab-stop')],
] as const)('ignores keys from the interactive %s target', (_name, getTarget) => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(getTarget(), { key: 'j' })).toBe(true)

  expect(callbacks.moveLines).not.toHaveBeenCalled()
})

test('handles keys from the noninteractive document root and its plain descendants', () => {
  const callbacks = createCallbacks()
  render(<Harness callbacks={callbacks} />)

  expect(fireEvent.keyDown(screen.getByTestId('document-root'), { key: 'j' })).toBe(false)
  expect(fireEvent.keyDown(screen.getByTestId('plain-line'), { key: 'k' })).toBe(false)

  expect(callbacks.moveLines).toHaveBeenNthCalledWith(1, 1)
  expect(callbacks.moveLines).toHaveBeenNthCalledWith(2, -1)
})
