import { fireEvent, render, screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import { portfolioData } from '../../data/portfolio'
import { createBufferRegistry } from '../buffers/createBufferRegistry'
import { DocumentBuffer } from '../document/DocumentBuffer'
import type { DocumentLine } from '../document/types'
import { BufferSearch } from './BufferSearch'

const registry = createBufferRegistry(portfolioData)
const readme = registry.byId.get('readme')!

function renderSearch(overrides: Partial<React.ComponentProps<typeof BufferSearch>> = {}) {
  const onClose = vi.fn()
  const onNext = vi.fn()
  const onPrevious = vi.fn()
  const onQueryChange = vi.fn()

  render(
    <BufferSearch
      query="casey"
      matchCount={3}
      currentMatch={1}
      onClose={onClose}
      onNext={onNext}
      onPrevious={onPrevious}
      onQueryChange={onQueryChange}
      {...overrides}
    />,
  )

  return { onClose, onNext, onPrevious, onQueryChange }
}

test('autofocuses a labeled slash-prefixed search input and announces its match position', () => {
  renderSearch()

  const search = screen.getByRole('search', { name: 'Search current buffer' })
  const input = within(search).getByRole('searchbox', { name: 'Search current buffer' })
  expect(input).toHaveFocus()
  expect(input).toHaveValue('casey')
  expect(within(search).getByText('/')).toBeVisible()
  expect(within(search).getByText('2 of 3 matches')).toBeVisible()
})

test('publishes query edits and maps Enter or Shift+Enter to search traversal', () => {
  const { onNext, onPrevious, onQueryChange } = renderSearch()
  const input = screen.getByRole('searchbox', { name: 'Search current buffer' })

  fireEvent.change(input, { target: { value: 'engineer' } })
  expect(onQueryChange).toHaveBeenCalledWith('engineer')

  expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(false)
  expect(onNext).toHaveBeenCalledOnce()

  expect(fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })).toBe(false)
  expect(onPrevious).toHaveBeenCalledOnce()
})

test('consumes Escape and dismisses the search', () => {
  const { onClose } = renderSearch()
  const input = screen.getByRole('searchbox', { name: 'Search current buffer' })

  expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(false)

  expect(onClose).toHaveBeenCalledOnce()
})

test('renders an empty match count without inventing a current position', () => {
  renderSearch({ matchCount: 0, currentMatch: null })

  expect(screen.getByText('0 matches')).toBeVisible()
  expect(screen.queryByText(/of 0 matches/)).not.toBeInTheDocument()
})

test('keeps semantic document content intact while matched lines are highlighted', () => {
  const lines: DocumentLine[] = [
    {
      id: 'readme-line-1',
      number: 1,
      searchText: 'Casey Franceschy',
      content: <h1>Casey Franceschy</h1>,
    },
    {
      id: 'readme-line-2',
      number: 2,
      searchText: 'Open experience',
      content: <button type="button">View experience</button>,
    },
  ]

  render(
    <>
      <DocumentBuffer buffer={readme} lines={lines} matchIndexes={[0]} />
      <BufferSearch
        query="casey"
        matchCount={1}
        currentMatch={0}
        onClose={() => undefined}
        onNext={() => undefined}
        onPrevious={() => undefined}
        onQueryChange={() => undefined}
      />
    </>,
  )

  const matchedLine = document.querySelector('[data-editor-line-id="readme-line-1"]')
  expect(matchedLine).toHaveClass('document-line--search-match')
  expect(within(matchedLine as HTMLElement).getByRole('heading', {
    name: 'Casey Franceschy',
  })).toBeVisible()
  expect(screen.getByRole('button', { name: 'View experience' })).toBeVisible()
})
