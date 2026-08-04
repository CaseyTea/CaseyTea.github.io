import { fireEvent, render, screen } from '@testing-library/react'
import { useEffect, useRef, useState } from 'react'
import { vi } from 'vitest'
import { portfolioData } from '../../data/portfolio'
import type { Command } from '../../data/types'
import { createBufferRegistry } from '../buffers/createBufferRegistry'
import type { BufferId } from '../buffers/types'
import { EditorCommandMode } from './EditorCommandMode'

const registry = createBufferRegistry(portfolioData)

function createCommands(): Command[] {
  return [
    {
      id: 'overview',
      label: 'Go to overview',
      keywords: ['home'],
      run: vi.fn(),
    },
    {
      id: 'contact',
      label: 'Go to contact',
      keywords: ['email'],
      run: vi.fn(),
    },
  ]
}

function createProps(overrides: Partial<React.ComponentProps<typeof EditorCommandMode>> = {}) {
  return {
    commands: createCommands(),
    registry,
    isSearchOpen: false,
    onOpenBuffer: vi.fn(),
    onResume: vi.fn(),
    onSetVim: vi.fn(),
    onStatusMessage: vi.fn(),
    ...overrides,
  }
}

function openCommandMode(init: KeyboardEventInit = { key: ':' }) {
  fireEvent.keyDown(window, init)
}

test('opens with colon and Command or Control+K only outside editable targets', () => {
  render(
    <>
      <input aria-label="Editable example" />
      <EditorCommandMode {...createProps()} />
    </>,
  )

  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Editable example' }), { key: ':' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  openCommandMode()
  expect(screen.getByRole('dialog', { name: 'Portfolio commands' })).toBeVisible()
})

test.each([
  { key: 'k', ctrlKey: true },
  { key: 'k', metaKey: true },
] as const)('opens with the platform command shortcut $key', (shortcut) => {
  render(<EditorCommandMode {...createProps()} />)

  openCommandMode(shortcut)

  expect(screen.getByRole('combobox', { name: 'Find a command' })).toHaveFocus()
})

test('does not open while buffer search is active', () => {
  render(<EditorCommandMode {...createProps({ isSearchOpen: true })} />)

  expect(fireEvent.keyDown(window, { key: ':' })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'k', ctrlKey: true })).toBe(true)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('keeps arrow selection available for fuzzy palette commands', () => {
  const commands = createCommands()
  render(<EditorCommandMode {...createProps({ commands })} />)
  openCommandMode({ key: 'k', ctrlKey: true })

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.keyDown(input, { key: 'ArrowDown' })
  expect(input).toHaveAttribute('aria-activedescendant', 'command-option-contact')
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(commands[1].run).toHaveBeenCalledOnce()
})

test('restores the invoking focus when Escape closes command mode', () => {
  render(
    <>
      <button type="button">Invoker</button>
      <EditorCommandMode {...createProps()} />
    </>,
  )
  const invoker = screen.getByRole('button', { name: 'Invoker' })
  invoker.focus()
  openCommandMode()

  fireEvent.keyDown(screen.getByRole('combobox', { name: 'Find a command' }), {
    key: 'Escape',
  })

  expect(invoker).toHaveFocus()
})

test.each([
  [':help', 'help'],
  [':e experience.log', 'experience'],
  [':e GuessThatAsciiMon', 'project-guess-that-ascii-mon'],
] as const)('executes buffer command %s', (input, expectedId) => {
  const onOpenBuffer = vi.fn()
  render(<EditorCommandMode {...createProps({ onOpenBuffer })} />)
  openCommandMode()

  fireEvent.change(screen.getByRole('combobox', { name: 'Find a command' }), {
    target: { value: input },
  })
  fireEvent.keyDown(screen.getByRole('combobox', { name: 'Find a command' }), {
    key: 'Enter',
  })

  expect(onOpenBuffer).toHaveBeenCalledWith(expectedId)
})

function FocusTransferHarness() {
  const [activeId, setActiveId] = useState<BufferId>('readme')
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [activeId])

  return (
    <>
      <button type="button">Invoker</button>
      <h1 ref={headingRef} tabIndex={-1}>
        {registry.byId.get(activeId)?.title}
      </h1>
      <EditorCommandMode
        {...createProps({ onOpenBuffer: setActiveId })}
      />
    </>
  )
}

test('lets a buffer command transfer focus to the newly opened heading', () => {
  render(<FocusTransferHarness />)
  const invoker = screen.getByRole('button', { name: 'Invoker' })
  invoker.focus()
  openCommandMode()

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: ':e experience.log' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(screen.getByRole('heading', { name: 'Experience' })).toHaveFocus()
  expect(invoker).not.toHaveFocus()
})

test('runs resume through the provided semantic link action', () => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  const onResume = () =>
    document.querySelector<HTMLAnchorElement>('a[download][href="/resume.pdf"]')?.click()
  render(
    <>
      <a href="/resume.pdf" download>
        Download resume
      </a>
      <EditorCommandMode {...createProps({ onResume })} />
    </>,
  )
  openCommandMode()

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: ':resume' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(screen.getByRole('link', { name: 'Download resume' })).toHaveAttribute(
    'href',
    '/resume.pdf',
  )
  expect(screen.getByRole('link', { name: 'Download resume' })).toHaveAttribute('download')
  expect(click).toHaveBeenCalledOnce()
})

test.each([
  [':vim on', true],
  [':vim off', false],
] as const)('executes preference command %s', (input, enabled) => {
  const onSetVim = vi.fn()
  render(<EditorCommandMode {...createProps({ onSetVim })} />)
  openCommandMode()

  const commandInput = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(commandInput, { target: { value: input } })
  fireEvent.keyDown(commandInput, { key: 'Enter' })

  expect(onSetVim).toHaveBeenCalledWith(enabled)
})

test('reports invalid commands without changing the current buffer', () => {
  const onOpenBuffer = vi.fn()
  const onStatusMessage = vi.fn()
  render(<EditorCommandMode {...createProps({ onOpenBuffer, onStatusMessage })} />)
  openCommandMode()

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: ':does-not-exist' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(onOpenBuffer).not.toHaveBeenCalled()
  expect(onStatusMessage).toHaveBeenCalledWith(
    'not an editor command: does-not-exist',
  )
})
