import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import type { Command } from '../../data/types'
import { CommandPalette } from './CommandPalette'

function createCommands(): Command[] {
  return [
    {
      id: 'overview',
      label: 'Go to overview',
      keywords: ['home', 'introduction'],
      run: vi.fn(),
    },
    {
      id: 'resume',
      label: 'Download resume',
      keywords: ['resume', 'cv', 'pdf'],
      run: vi.fn(),
    },
    {
      id: 'contact',
      label: 'Go to contact',
      keywords: ['email', 'connect'],
      run: vi.fn(),
    },
  ]
}

function openWithColon() {
  fireEvent.keyDown(window, { key: ':' })
}

test('opens the command dialog with colon and Control+K', () => {
  const { unmount } = render(<CommandPalette commands={createCommands()} />)

  openWithColon()
  expect(screen.getByRole('dialog', { name: 'Portfolio commands' })).toBeVisible()

  unmount()
  render(<CommandPalette commands={createCommands()} />)

  fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
  expect(screen.getByRole('dialog', { name: 'Portfolio commands' })).toBeVisible()
})

test('opens with Command+K and leaves modified browser shortcuts alone', () => {
  const { unmount } = render(<CommandPalette commands={createCommands()} />)

  fireEvent.keyDown(window, { key: 'k', metaKey: true })
  expect(screen.getByRole('dialog', { name: 'Portfolio commands' })).toBeVisible()

  unmount()
  render(<CommandPalette commands={createCommands()} />)

  expect(fireEvent.keyDown(window, { key: 'k', ctrlKey: true, shiftKey: true })).toBe(true)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('prevents default only for recognized opening shortcuts', () => {
  render(<CommandPalette commands={createCommands()} />)

  expect(fireEvent.keyDown(window, { key: 'l', ctrlKey: true })).toBe(true)
  expect(fireEvent.keyDown(window, { key: ':' })).toBe(false)
})

test('does not open from colon typed in an editable field', () => {
  render(
    <>
      <input aria-label="Example field" />
      <CommandPalette commands={createCommands()} />
    </>,
  )

  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Example field' }), { key: ':' })

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test.each([
  ['textarea', <textarea data-testid="editable-target" key="textarea" />],
  [
    'select',
    <select data-testid="editable-target" key="select">
      <option>Example</option>
    </select>,
  ],
  [
    'contenteditable',
    <div contentEditable data-testid="editable-target" key="contenteditable" />,
  ],
])('does not open from colon typed in a %s', (_name, editableTarget) => {
  render(
    <>
      {editableTarget}
      <CommandPalette commands={createCommands()} />
    </>,
  )

  fireEvent.keyDown(screen.getByTestId('editable-target'), { key: ':' })

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test.each([
  ['button', <button data-testid="interactive-target" key="button" type="button">Action</button>],
  ['link', <a data-testid="interactive-target" href="#example" key="link">Link</a>],
  ['summary', <summary data-testid="interactive-target" key="summary">Details</summary>],
  ['audio control', <audio controls data-testid="interactive-target" key="audio" />],
  ['video control', <video controls data-testid="interactive-target" key="video" />],
  ['tab stop', <div data-testid="interactive-target" key="tab-stop" tabIndex={0}>Focusable</div>],
])('leaves global command shortcuts alone on an interactive %s', (_name, interactiveTarget) => {
  render(
    <>
      {interactiveTarget}
      <CommandPalette commands={createCommands()} />
    </>,
  )

  const target = screen.getByTestId('interactive-target')
  fireEvent.keyDown(target, { key: ':' })
  fireEvent.keyDown(target, { key: 'k', ctrlKey: true })

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('filters commands by keywords as the user types', () => {
  render(<CommandPalette commands={createCommands()} />)
  openWithColon()

  fireEvent.change(screen.getByRole('combobox', { name: 'Find a command' }), {
    target: { value: 'resume' },
  })

  expect(screen.getByRole('option', { name: 'Download resume' })).toBeVisible()
  expect(screen.queryByRole('option', { name: 'Go to overview' })).not.toBeInTheDocument()
})

test('presents the input as an editor command line without changing its accessible label', () => {
  render(<CommandPalette commands={createCommands()} />)
  openWithColon()

  expect(screen.getByText(':')).toHaveAttribute('aria-hidden', 'true')
  expect(screen.getByRole('combobox', { name: 'Find a command' })).toBeVisible()
})

test('moves selection with arrow keys and activates the selected command with Enter', () => {
  const commands = createCommands()
  render(<CommandPalette commands={commands} />)
  openWithColon()

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  expect(input).toHaveAttribute('aria-activedescendant', 'command-option-overview')

  fireEvent.keyDown(input, { key: 'ArrowDown' })
  expect(input).toHaveAttribute('aria-activedescendant', 'command-option-resume')

  fireEvent.keyDown(input, { key: 'Enter' })
  expect(commands[1].run).toHaveBeenCalledOnce()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('restores the invoking focus after activating a command', () => {
  const commands = createCommands()
  render(
    <>
      <button type="button">Open from here</button>
      <CommandPalette commands={commands} />
    </>,
  )

  const trigger = screen.getByRole('button', { name: 'Open from here' })
  trigger.focus()
  openWithColon()
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })

  expect(commands[0].run).toHaveBeenCalledOnce()
  expect(trigger).toHaveFocus()
})

test('closes with Escape and clears the previous query for the next open', () => {
  render(<CommandPalette commands={createCommands()} />)
  openWithColon()

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'resume' } })
  fireEvent.keyDown(input, { key: 'Escape' })

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  openWithColon()
  expect(screen.getByRole('combobox', { name: 'Find a command' })).toHaveValue('')
})

test('returns focus to the previously focused element after closing', () => {
  render(
    <>
      <button type="button">Open from here</button>
      <CommandPalette commands={createCommands()} />
    </>,
  )

  const trigger = screen.getByRole('button', { name: 'Open from here' })
  trigger.focus()
  openWithColon()
  expect(screen.getByRole('combobox', { name: 'Find a command' })).toHaveFocus()

  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
  expect(trigger).toHaveFocus()
})

test('keeps Tab focus within the modal dialog', () => {
  render(<CommandPalette commands={createCommands()} />)
  openWithColon()

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  const close = screen.getByRole('button', { name: 'Close Esc' })

  fireEvent.keyDown(input, { key: 'Tab' })
  expect(close).toHaveFocus()

  fireEvent.keyDown(close, { key: 'Tab', shiftKey: true })
  expect(input).toHaveFocus()
})

test('does not run the active command when Enter is pressed on the Close button', () => {
  const commands = createCommands()
  render(<CommandPalette commands={commands} />)
  openWithColon()

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  const close = screen.getByRole('button', { name: 'Close Esc' })
  fireEvent.keyDown(input, { key: 'Tab' })
  fireEvent.keyDown(close, { key: 'Enter' })

  expect(commands[0].run).not.toHaveBeenCalled()
})

test('prevents backdrop focus transfer and restores the previous focus', () => {
  render(
    <>
      <button type="button">Open from here</button>
      <CommandPalette commands={createCommands()} />
    </>,
  )

  const trigger = screen.getByRole('button', { name: 'Open from here' })
  trigger.focus()
  openWithColon()

  const backdrop = screen.getByRole('dialog', { name: 'Portfolio commands' }).parentElement
  expect(backdrop).not.toBeNull()
  expect(fireEvent.mouseDown(backdrop!)).toBe(false)
  expect(trigger).toHaveFocus()
})

test('shows an empty result message when no command matches', () => {
  render(<CommandPalette commands={createCommands()} />)
  openWithColon()

  fireEvent.change(screen.getByRole('combobox', { name: 'Find a command' }), {
    target: { value: 'nonexistent command' },
  })

  expect(screen.getByText('No matching commands.')).toBeVisible()
  expect(screen.queryByRole('option')).not.toBeInTheDocument()
})
