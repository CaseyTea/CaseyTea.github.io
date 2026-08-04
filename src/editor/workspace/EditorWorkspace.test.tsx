import { fireEvent, render, screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import { createBufferRegistry } from '../buffers/createBufferRegistry'
import type { BufferId } from '../buffers/types'
import { portfolioData } from '../../data/portfolio'
import { EditorWorkspace } from './EditorWorkspace'

const registry = createBufferRegistry(portfolioData)
const projectId = registry.primaryIds.find((id) => id.startsWith('project-')) as BufferId

function renderWorkspace(overrides: Partial<React.ComponentProps<typeof EditorWorkspace>> = {}) {
  const onOpenBuffer = vi.fn()
  const onCycleBuffer = vi.fn()
  const onToggleVim = vi.fn()

  render(
    <EditorWorkspace
      portfolioData={portfolioData}
      registry={registry}
      activeId={projectId}
      openIds={['readme', projectId]}
      onOpenBuffer={onOpenBuffer}
      onCycleBuffer={onCycleBuffer}
      vimEnabled
      onToggleVim={onToggleVim}
      statusMessage="project loaded"
      {...overrides}
    >
      <article>Buffer content</article>
    </EditorWorkspace>,
  )

  return { onOpenBuffer, onCycleBuffer, onToggleVim }
}

test('renders the editor identity and visitor controls', () => {
  const providedPortfolio = {
    ...portfolioData,
    name: 'Provided Portfolio Owner',
    title: 'Provided Portfolio Role',
    resumeUrl: '/provided-portfolio-resume.pdf',
  }
  const { onOpenBuffer } = renderWorkspace({ portfolioData: providedPortfolio })

  const banner = screen.getByRole('banner')
  expect(within(banner).getByText(providedPortfolio.name)).toBeVisible()
  expect(within(banner).getByText(providedPortfolio.title)).toBeVisible()
  expect(within(banner).getByRole('link', { name: 'Download resume' })).toHaveAttribute(
    'href',
    providedPortfolio.resumeUrl,
  )

  fireEvent.click(within(banner).getByRole('button', { name: 'Keyboard shortcuts' }))
  expect(onOpenBuffer).toHaveBeenCalledWith('help')
})

test('provides semantic file navigation and identifies the current file', () => {
  const { onOpenBuffer, onToggleVim } = renderWorkspace()
  const explorer = screen.getByRole('navigation', { name: 'Files' })
  const activeBuffer = registry.byId.get(projectId)!

  expect(within(explorer).getByText('Explorer')).toBeVisible()
  expect(within(explorer).getByText('projects/')).toBeVisible()
  const projects = within(explorer).getByRole('list', { name: 'projects folder' })
  expect(within(projects).getAllByRole('listitem')).toHaveLength(portfolioData.projects.length)
  portfolioData.projects.forEach(({ id }) => {
    expect(
      within(projects).getByRole('button', { name: `projects/${id}.md` }),
    ).toBeVisible()
  })
  expect(within(explorer).getByRole('button', { name: activeBuffer.path })).toHaveAttribute(
    'aria-current',
    'page',
  )

  fireEvent.click(within(explorer).getByRole('button', { name: 'contact.md' }))
  expect(onOpenBuffer).toHaveBeenCalledWith('contact')

  fireEvent.click(within(explorer).getByRole('button', { name: 'Editor keys: on' }))
  expect(onToggleVim).toHaveBeenCalledOnce()
})

test('renders semantic tabs with short labels and accessible full paths', () => {
  const { onOpenBuffer, onCycleBuffer } = renderWorkspace()
  const tabs = screen.getByRole('tablist', { name: 'Open files' })
  const project = registry.byId.get(projectId)!
  const projectTab = within(tabs).getByRole('tab', { name: `Open ${project.path}` })
  const readmeTab = within(tabs).getByRole('tab', { name: 'Open README.md' })

  expect(projectTab).toHaveTextContent(project.filename)
  expect(projectTab).not.toHaveTextContent(project.path)
  expect(projectTab).toHaveAttribute('aria-selected', 'true')
  expect(readmeTab).toHaveAttribute('aria-selected', 'false')

  fireEvent.click(readmeTab)
  expect(onOpenBuffer).toHaveBeenCalledWith('readme')

  projectTab.focus()
  fireEvent.keyDown(tabs, { key: 'ArrowRight' })
  expect(readmeTab).toHaveFocus()

  projectTab.focus()
  fireEvent.keyDown(tabs, { key: 'ArrowLeft' })
  expect(readmeTab).toHaveFocus()
  expect(onCycleBuffer).toHaveBeenNthCalledWith(1, 1)
  expect(onCycleBuffer).toHaveBeenNthCalledWith(2, -1)
})

test('labels the buffer slot and exposes editor status fields', () => {
  renderWorkspace({ activeLineIndex: 2, lineCount: 4, isCommandOpen: true })
  const activeBuffer = registry.byId.get(projectId)!

  expect(screen.getByRole('main')).toHaveAttribute('id', 'active-buffer')
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', activeBuffer.path)
  const panel = within(screen.getByRole('main')).getByRole('tabpanel')
  const activeTab = screen.getByRole('tab', { name: `Open ${activeBuffer.path}` })
  expect(activeTab).toHaveAttribute('aria-controls', panel.id)
  expect(panel).toHaveAttribute('aria-labelledby', activeTab.id)
  expect(within(panel).getByText('Buffer content')).toBeVisible()

  const status = screen.getByRole('contentinfo', { name: 'Editor status' })
  expect(within(status).getByText('-- COMMAND --')).toBeVisible()
  expect(within(status).getByText(activeBuffer.path)).toBeVisible()
  expect(within(status).getByText(activeBuffer.kind)).toBeVisible()
  expect(within(status).getByText('vim')).toBeVisible()
  expect(within(status).getByText('3,1')).toBeVisible()
  expect(within(status).getByText('75%')).toBeVisible()
  expect(within(status).getByRole('status')).toHaveTextContent('project loaded')
})

test('uses reading status when editor keys are disabled', () => {
  renderWorkspace({ vimEnabled: false, statusMessage: null })

  const status = screen.getByRole('contentinfo', { name: 'Editor status' })
  expect(within(status).getByText('-- READING --')).toBeVisible()
  expect(within(status).getByText('no-vim')).toBeVisible()
  expect(within(status).getByRole('status')).toHaveTextContent(
    'click a file, or turn editor keys on in the sidebar',
  )
})
