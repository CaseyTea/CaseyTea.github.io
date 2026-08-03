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
      label: 'Download résumé',
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

test('filters commands by keywords as the user types', () => {
  render(<CommandPalette commands={createCommands()} />)
  openWithColon()

  fireEvent.change(screen.getByRole('combobox', { name: 'Find a command' }), {
    target: { value: 'resume' },
  })

  expect(screen.getByRole('option', { name: 'Download résumé' })).toBeVisible()
  expect(screen.queryByRole('option', { name: 'Go to overview' })).not.toBeInTheDocument()
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

test('shows an empty result message when no command matches', () => {
  render(<CommandPalette commands={createCommands()} />)
  openWithColon()

  fireEvent.change(screen.getByRole('combobox', { name: 'Find a command' }), {
    target: { value: 'nonexistent command' },
  })

  expect(screen.getByText('No matching commands.')).toBeVisible()
  expect(screen.queryByRole('option')).not.toBeInTheDocument()
})
