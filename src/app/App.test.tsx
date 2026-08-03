import { render, screen, within } from '@testing-library/react'
import { App } from './App'

const sectionLinks = [
  ['About', '#about'],
  ['Experience', '#experience'],
  ['Projects', '#projects'],
  ['Contact', '#contact'],
] as const

test('renders Casey’s role and résumé link', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: /Casey Franceschy/i })).toBeVisible()
  expect(
    within(screen.getByRole('banner')).getByRole('link', { name: /download résumé/i }),
  ).toHaveAttribute('href', '/assets/Casey_Franceschy.pdf')
})

test('provides semantic landmarks and accessible portfolio navigation', () => {
  render(<App />)

  expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute(
    'href',
    '#main-content',
  )
  expect(screen.getByRole('banner')).toBeVisible()
  expect(screen.getByRole('navigation', { name: 'Portfolio sections' })).toBeVisible()
  expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  expect(screen.getByRole('contentinfo')).toBeVisible()

  sectionLinks.forEach(([label, href]) => {
    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href)
    expect(screen.getByRole('link', { name: label })).toBeVisible()
  })
})

test('identifies Casey and labels the professional profile links', () => {
  render(<App />)

  expect(screen.getByRole('img', { name: /Casey Franceschy/i })).toHaveAttribute(
    'src',
    '/assets/my-memoji.png',
  )
  expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/CaseyTea',
  )
  expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/casey-franceschy-694823124/',
  )
})

test('renders the complete portfolio as six named regions', () => {
  render(<App />)

  const sections = [
    ['overview', /software that makes useful work easier/i],
    ['experience', /experience/i],
    ['projects', /selected projects/i],
    ['skills', /skills/i],
    ['about', /about me/i],
    ['contact', /let’s work together/i],
  ] as const

  sections.forEach(([id, name]) => {
    expect(screen.getByRole('region', { name })).toHaveAttribute('id', id)
  })
})

test('shows three career metrics and keeps professional work before side projects', () => {
  render(<App />)

  const overview = screen.getByRole('region', { name: /software that makes useful work easier/i })
  expect(within(overview).getAllByRole('term')).toHaveLength(3)

  const professionalHeading = screen.getByRole('heading', { name: 'Professional work' })
  const sideProjectHeading = screen.getByRole('heading', { name: 'Side projects' })

  expect(
    professionalHeading.compareDocumentPosition(sideProjectHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
})

test('points every résumé action to the PDF asset', () => {
  render(<App />)

  const resumeActions = screen.getAllByRole('link', { name: /résumé/i })

  expect(resumeActions.length).toBeGreaterThan(1)
  resumeActions.forEach((action) => {
    expect(action).toHaveAttribute('href', '/assets/Casey_Franceschy.pdf')
  })
})
