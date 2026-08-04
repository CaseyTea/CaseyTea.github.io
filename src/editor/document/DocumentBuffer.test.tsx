import { render, screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import { portfolioData } from '../../data/portfolio'
import { createBufferRegistry } from '../buffers/createBufferRegistry'
import { EditorWorkspace } from '../workspace/EditorWorkspace'
import { DocumentBuffer } from './DocumentBuffer'
import { getDocumentHeadingId } from './documentIds'
import type { DocumentLine } from './types'

const registry = createBufferRegistry(portfolioData)
const readme = registry.byId.get('readme')!

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
    action: { label: 'Open experience', run: () => undefined },
  },
]

test('renders stable two-column lines with hidden gutter numbers and semantic content', () => {
  render(<DocumentBuffer buffer={readme} lines={lines} activeIndex={1} matchIndexes={[0]} />)

  const document = screen.getByRole('article', { name: 'Casey Franceschy' })
  const renderedLines = document.querySelectorAll('[data-editor-line]')

  expect(renderedLines).toHaveLength(2)
  expect(renderedLines[0]).toHaveAttribute('id', 'readme-line-1')
  expect(renderedLines[0]).toHaveAttribute('data-editor-line-id', 'readme-line-1')
  expect(renderedLines[0]).toHaveClass('document-line--search-match')
  expect(renderedLines[1]).toHaveAttribute('aria-current', 'true')
  expect(renderedLines[1]).toHaveClass('document-line--active')
  expect(screen.getByText('1')).toHaveAttribute('aria-hidden', 'true')
  expect(screen.getByText('2')).toHaveAttribute('aria-hidden', 'true')
  expect(within(document).getByRole('heading', { name: 'Casey Franceschy' })).toBeVisible()
  expect(within(document).getByRole('button', { name: 'View experience' })).toBeVisible()
})

test('focuses the selected buffer heading without scrolling and announces line actions', () => {
  const focus = vi.spyOn(HTMLElement.prototype, 'focus')

  render(<DocumentBuffer buffer={readme} lines={lines} />)

  const heading = screen.getByRole('heading', { name: 'Casey Franceschy' })
  expect(heading).toHaveAttribute('id', getDocumentHeadingId(readme.id))
  expect(heading).toHaveAttribute('tabindex', '-1')
  expect(heading).toHaveFocus()
  expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  expect(screen.getByText('Action: Open experience')).toHaveClass(
    'document-line__action-label',
  )
})

test('the workspace skip link targets the selected buffer heading', () => {
  render(
    <EditorWorkspace
      portfolioData={portfolioData}
      registry={registry}
      activeId="readme"
      openIds={['readme', 'experience']}
      onOpenBuffer={() => undefined}
      onCycleBuffer={() => undefined}
      vimEnabled
      onToggleVim={() => undefined}
      statusMessage={null}
    >
      <DocumentBuffer buffer={readme} lines={lines} />
    </EditorWorkspace>,
  )

  const heading = screen.getByRole('heading', { name: 'Casey Franceschy' })
  expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
    'href',
    `#${heading.id}`,
  )
})
