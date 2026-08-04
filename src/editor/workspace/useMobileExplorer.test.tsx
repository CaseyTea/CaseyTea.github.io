import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { portfolioData } from '../../data/portfolio'
import { createBufferRegistry } from '../buffers/createBufferRegistry'
import type { BufferId } from '../buffers/types'
import { EditorWorkspace } from './EditorWorkspace'

const registry = createBufferRegistry(portfolioData)

function stubMediaQuery(initialMatches: boolean) {
  let matches = initialMatches
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const mediaQuery = {
    get matches() {
      return matches
    },
    media: '(max-width: 48rem)',
    onchange: null,
    addEventListener: vi.fn((_event: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    }),
    removeEventListener: vi.fn((_event: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    }),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }

  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches
      listeners.forEach((listener) =>
        listener({ matches, media: mediaQuery.media } as MediaQueryListEvent),
      )
    },
  }
}

function renderWorkspace() {
  const onOpenBuffer = vi.fn()

  render(
    <EditorWorkspace
      portfolioData={portfolioData}
      registry={registry}
      activeId="readme"
      openIds={['readme', 'experience']}
      onOpenBuffer={onOpenBuffer}
      onCycleBuffer={vi.fn()}
      vimEnabled
      onToggleVim={vi.fn()}
      statusMessage={null}
    >
      Buffer
    </EditorWorkspace>,
  )

  return { onOpenBuffer }
}

beforeEach(() => {
  stubMediaQuery(true)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test('opens the mobile explorer from Files and keeps its navigation accessible', () => {
  renderWorkspace()
  const filesButton = screen.getByRole('button', { name: 'Files' })
  const explorer = document.getElementById('portfolio-explorer')!

  expect(filesButton).toHaveAttribute('aria-expanded', 'false')
  expect(explorer).toHaveAttribute('aria-hidden', 'true')
  expect(screen.queryByRole('navigation', { name: 'Files' })).not.toBeInTheDocument()

  fireEvent.click(filesButton)

  expect(filesButton).toHaveAttribute('aria-expanded', 'true')
  expect(explorer).toHaveClass('editor-explorer--open')
  expect(explorer).not.toHaveAttribute('aria-hidden')
  expect(screen.getByRole('navigation', { name: 'Files' })).toBe(explorer)
  expect(screen.getByRole('button', { name: 'Close files' })).toBeVisible()
})

test('dismisses the explorer with Escape and returns focus to Files', () => {
  renderWorkspace()
  const filesButton = screen.getByRole('button', { name: 'Files' })
  fireEvent.click(filesButton)
  filesButton.blur()

  fireEvent.keyDown(window, { key: 'Escape' })

  expect(filesButton).toHaveFocus()
  expect(filesButton).toHaveAttribute('aria-expanded', 'false')
  expect(document.getElementById('portfolio-explorer')).not.toHaveClass(
    'editor-explorer--open',
  )
})

test('dismisses from the overlay and returns focus to Files', () => {
  renderWorkspace()
  const filesButton = screen.getByRole('button', { name: 'Files' })
  fireEvent.click(filesButton)
  filesButton.blur()

  fireEvent.click(screen.getByRole('button', { name: 'Close files' }))

  expect(filesButton).toHaveFocus()
  expect(screen.queryByRole('button', { name: 'Close files' })).not.toBeInTheDocument()
})

test('closes after file selection without moving focus back to Files', () => {
  const { onOpenBuffer } = renderWorkspace()
  const filesButton = screen.getByRole('button', { name: 'Files' })
  fireEvent.click(filesButton)
  const explorer = screen.getByRole('navigation', { name: 'Files' })

  fireEvent.click(within(explorer).getByRole('button', { name: 'contact.md' }))

  expect(onOpenBuffer).toHaveBeenCalledWith('contact' satisfies BufferId)
  expect(explorer).not.toHaveClass('editor-explorer--open')
  expect(explorer).toHaveAttribute('aria-hidden', 'true')
  expect(filesButton).not.toHaveFocus()
})

test('keeps desktop explorer navigation exposed to assistive technology', () => {
  vi.unstubAllGlobals()
  stubMediaQuery(false)
  renderWorkspace()

  const explorer = screen.getByRole('navigation', { name: 'Files' })
  expect(explorer).not.toHaveAttribute('aria-hidden')
  expect(explorer).not.toHaveAttribute('inert')
})

test('closes the drawer and exposes the explorer when resizing to desktop', () => {
  vi.unstubAllGlobals()
  const viewport = stubMediaQuery(true)
  renderWorkspace()
  const filesButton = screen.getByRole('button', { name: 'Files' })
  fireEvent.click(filesButton)

  act(() => viewport.setMatches(false))

  const explorer = screen.getByRole('navigation', { name: 'Files' })
  expect(filesButton).toHaveAttribute('aria-expanded', 'false')
  expect(explorer).not.toHaveClass('editor-explorer--open')
  expect(explorer).not.toHaveAttribute('aria-hidden')
  expect(screen.queryByRole('button', { name: 'Close files' })).not.toBeInTheDocument()
})
