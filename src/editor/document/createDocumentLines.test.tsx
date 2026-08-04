import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { portfolioData } from '../../data/portfolio'
import { createBufferRegistry } from '../buffers/createBufferRegistry'
import type { BufferId } from '../buffers/types'
import { createDocumentLines } from './createDocumentLines'
import type { DocumentActions } from './types'

const registry = createBufferRegistry(portfolioData)
const actions: DocumentActions = {
  openBuffer: () => undefined,
  openLink: () => undefined,
  downloadResume: () => undefined,
}

function renderBuffer(id: BufferId) {
  const buffer = registry.byId.get(id)

  if (!buffer) throw new Error(`Missing test buffer: ${id}`)

  const lines = createDocumentLines(buffer, portfolioData, actions)
  render(<>{lines.map(({ id: lineId, content }) => <div key={lineId}>{content}</div>)}</>)

  return lines
}

function renderLineContent(content: ReactNode) {
  const { container } = render(<>{content}</>)
  return container
}

test('README presents Casey, the role, all impact metrics, and primary actions', () => {
  const lines = renderBuffer('readme')

  expect(screen.getByRole('heading', { level: 1, name: portfolioData.name })).toBeVisible()
  expect(screen.getByText(portfolioData.title)).toBeVisible()

  const metrics = screen.getByRole('list', { name: 'Career impact' })
  portfolioData.metrics.forEach(({ label, value }) => {
    expect(within(metrics).getByText(value)).toBeVisible()
    expect(within(metrics).getByText(label)).toBeVisible()
  })

  expect(screen.getByRole('button', { name: 'View experience' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Browse projects' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Download resume' })).toHaveAttribute(
    'href',
    portfolioData.resumeUrl,
  )
  expect(lines.map(({ action }) => action?.label)).toEqual(
    expect.arrayContaining(['Open experience', 'Open projects', 'Download resume']),
  )
})

test('experience.log contains every real role and its evidence', () => {
  renderBuffer('experience')

  portfolioData.experience.forEach((experience) => {
    expect(screen.getByRole('heading', { name: experience.title })).toBeVisible()
    expect(screen.getAllByText(experience.organization).length).toBeGreaterThan(0)
    expect(screen.getByText(experience.dates)).toBeVisible()
    expect(screen.getByText(experience.summary)).toBeVisible()
    experience.highlights.forEach((highlight) => expect(screen.getByText(highlight)).toBeVisible())
  })
})

test.each(portfolioData.projects)(
  'project buffer for $name contains its own metadata and available links',
  (project) => {
    const lines = renderBuffer(`project-${project.id}`)

    expect(screen.getByRole('heading', { level: 1, name: project.name })).toBeVisible()
    expect(screen.getByText(project.outcome)).toBeVisible()
    expect(screen.getByText(project.context)).toBeVisible()
    expect(screen.getByText(project.contribution)).toBeVisible()
    project.technologies.forEach((technology) =>
      expect(screen.getByText(technology)).toBeVisible(),
    )

    if (project.sourceUrl) {
      expect(screen.getByRole('link', { name: 'View source' })).toHaveAttribute(
        'href',
        project.sourceUrl,
      )
      expect(lines.some(({ action }) => action?.label === 'Open project source')).toBe(true)
    }

    if (project.demoUrl) {
      expect(screen.getByRole('link', { name: 'View live project' })).toHaveAttribute(
        'href',
        project.demoUrl,
      )
      expect(lines.some(({ action }) => action?.label === 'Open live project')).toBe(true)
    }
  },
)

test('About, Contact, and Help use real data, semantic links, and documented shortcuts', () => {
  const aboutLines = createDocumentLines(registry.byId.get('about')!, portfolioData, actions)
  const about = renderLineContent(<>{aboutLines.map(({ content, id }) => <div key={id}>{content}</div>)}</>)
  expect(within(about).getByText(portfolioData.introduction)).toBeVisible()
  portfolioData.skillGroups.forEach(({ title }) =>
    expect(within(about).getByRole('heading', { name: title })).toBeVisible(),
  )

  const contactLines = createDocumentLines(registry.byId.get('contact')!, portfolioData, actions)
  const contact = renderLineContent(<>{contactLines.map(({ content, id }) => <div key={id}>{content}</div>)}</>)
  expect(within(contact).getByText(portfolioData.location)).toBeVisible()
  portfolioData.contacts.forEach(({ href, label }) =>
    expect(within(contact).getByRole('link', { name: label })).toHaveAttribute('href', href),
  )
  expect(within(contact).getByRole('link', { name: 'Download resume' })).toHaveAttribute(
    'href',
    portfolioData.resumeUrl,
  )

  const helpLines = createDocumentLines(registry.byId.get('help')!, portfolioData, actions)
  const help = renderLineContent(<>{helpLines.map(({ content, id }) => <div key={id}>{content}</div>)}</>)
  expect(help).toHaveTextContent(/mouse, touch, Tab, and Enter/i)
  expect(help).toHaveTextContent('1–7')
  expect(help).toHaveTextContent('j / k')
  expect(help).toHaveTextContent('gg / G')
  expect(help).toHaveTextContent('Command/Ctrl+K')
})

test('all generated document lines have stable numbering and no placeholder markers', () => {
  registry.byId.forEach((buffer) => {
    const lines = createDocumentLines(buffer, portfolioData, actions)

    expect(lines.length).toBeGreaterThan(0)
    expect(lines.map(({ number }) => number)).toEqual(
      Array.from({ length: lines.length }, (_, index) => index + 1),
    )
    expect(new Set(lines.map(({ id }) => id)).size).toBe(lines.length)
    expect(lines.map(({ searchText }) => searchText).join(' ')).not.toMatch(
      /needs:|\[\[|TBD|TODO/i,
    )
  })
})
