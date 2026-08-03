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

test('keeps personal topics in the About section', () => {
  render(<App />)

  const about = screen.getByRole('region', { name: /about me/i })
  const topics = [
    /mechanical keyboards/i,
    /Neovim/i,
    /Vim motions/i,
    /code jams/i,
    /frogs/i,
    /learning through playful projects/i,
  ]

  topics.forEach((topic) => expect(within(about).getByText(topic)).toBeVisible())
})

test('provides contact channels, verified location, and no contact form', () => {
  render(<App />)

  const contact = screen.getByRole('region', { name: /let’s work together/i })

  expect(within(contact).getByRole('link', { name: /email/i })).toHaveAttribute(
    'href',
    'mailto:casey.franceschy@gmail.com',
  )
  expect(within(contact).getByRole('link', { name: /github/i })).toHaveAttribute(
    'href',
    'https://github.com/CaseyTea',
  )
  expect(within(contact).getByRole('link', { name: /linkedin/i })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/casey-franceschy-694823124/',
  )
  expect(within(contact).getByText('Westminster, California')).toBeVisible()
  expect(contact.querySelector('form')).not.toBeInTheDocument()
})

test('groups evidence-backed skills without ratings or progress bars', () => {
  render(<App />)

  const skills = screen.getByRole('region', { name: /^skills$/i })

  expect(within(skills).getByRole('heading', { name: 'Application development' })).toBeVisible()
  expect(within(skills).getByRole('heading', { name: 'Data and APIs' })).toBeVisible()
  expect(within(skills).getByRole('heading', { name: 'Cloud and delivery' })).toBeVisible()
  expect(within(skills).getByText('.NET 8')).toBeVisible()
  expect(within(skills).getByText('REST APIs')).toBeVisible()
  expect(within(skills).getByText('Azure DevOps')).toBeVisible()
  expect(within(skills).queryByRole('progressbar')).not.toBeInTheDocument()
  expect(skills.querySelector('meter')).not.toBeInTheDocument()
})

test('renders project evidence and only the links available for each project', () => {
  render(<App />)

  const usernameGenerator = screen
    .getByRole('heading', { name: 'Username Generator API' })
    .closest('article')
  const asciiMon = screen.getByRole('heading', { name: 'GuessThatAsciiMon' }).closest('article')
  const mockBot = screen.getByRole('heading', { name: 'MockBot' }).closest('article')

  expect(usernameGenerator).not.toBeNull()
  expect(within(usernameGenerator!).getByText(/collision-free usernames/i)).toBeVisible()
  expect(within(usernameGenerator!).getByText(/Modernized a legacy SQL-based/i)).toBeVisible()
  expect(within(usernameGenerator!).getByText(/Built the \.NET Minimal API/i)).toBeVisible()
  expect(within(usernameGenerator!).getByRole('img')).toHaveAttribute(
    'src',
    '/assets/projects/project-usernamegen.png',
  )
  expect(
    within(
      within(usernameGenerator!).getByRole('list', {
        name: 'Username Generator API technologies',
      }),
    ).getAllByRole('listitem'),
  ).toHaveLength(4)
  expect(within(usernameGenerator!).queryByRole('link')).not.toBeInTheDocument()

  expect(asciiMon).not.toBeNull()
  expect(within(asciiMon!).getByRole('link', { name: 'View live project' })).toHaveAttribute(
    'href',
    'https://guessthatasciimon-hgdfeafdhqdddef0.canadacentral-01.azurewebsites.net/',
  )
  expect(within(asciiMon!).queryByRole('link', { name: 'View source' })).not.toBeInTheDocument()

  expect(mockBot).not.toBeNull()
  expect(within(mockBot!).getByRole('link', { name: 'View source' })).toHaveAttribute(
    'href',
    'https://github.com/CaseyTea/Mockbot',
  )
  expect(within(mockBot!).queryByRole('link', { name: 'View live project' })).not.toBeInTheDocument()
})
