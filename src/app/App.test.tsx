import { fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, vi } from 'vitest'
import { App } from './App'

const vimShortcutsStorageKey = 'portfolio:vim-scroll-shortcuts-enabled'

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key) {
      return values.get(key) ?? null
    },
    key(index) {
      return Array.from(values.keys())[index] ?? null
    },
    removeItem(key) {
      values.delete(key)
    },
    setItem(key, value) {
      values.set(key, value)
    },
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createMemoryStorage())
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const sectionLinks = [
  ['Overview', '#overview'],
  ['Experience', '#experience'],
  ['Projects', '#projects'],
  ['Skills', '#skills'],
  ['About', '#about'],
  ['Contact', '#contact'],
] as const

test('uses plain Resume terminology in visitor-facing app copy and metadata', () => {
  render(<App />)
  fireEvent.keyDown(window, { key: ':' })

  expect(document.body.textContent).not.toMatch(/résumé/i)

  const metadata = readFileSync('index.html', 'utf8')
  expect(metadata).not.toMatch(/résumé/i)
})

test('renders Casey’s role and resume link', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: /Casey Franceschy/i })).toBeVisible()
  expect(
    within(screen.getByRole('banner')).getByRole('link', { name: /download resume/i }),
  ).toHaveAttribute('href', '/assets/Casey_Franceschy.pdf')
})

test('provides semantic landmarks and accessible portfolio navigation', () => {
  window.history.replaceState(null, '', '/')
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

test('identifies the active section in visible navigation and follows hash changes', () => {
  window.history.replaceState(null, '', '/')
  render(<App />)

  const overviewLink = screen.getByRole('link', { name: 'Overview' })
  const skillsLink = screen.getByRole('link', { name: 'Skills' })

  expect(overviewLink).toHaveAttribute('aria-current', 'location')
  expect(skillsLink).not.toHaveAttribute('aria-current')
  expect(screen.getByLabelText('Current section: Overview')).toBeVisible()

  window.history.replaceState(null, '', '/#skills')
  fireEvent(window, new HashChangeEvent('hashchange'))

  expect(overviewLink).not.toHaveAttribute('aria-current')
  expect(skillsLink).toHaveAttribute('aria-current', 'location')
  expect(screen.getByLabelText('Current section: Skills')).toBeVisible()
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

test('points every resume action to the PDF asset', () => {
  render(<App />)

  const resumeActions = screen.getAllByRole('link', { name: /resume/i })

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

test('offers commands for every portfolio section without replacing visible navigation', () => {
  render(<App />)

  fireEvent.keyDown(window, { key: ':' })

  const options = within(screen.getByRole('listbox', { name: 'Available commands' }))
  ;[
    'Go to overview',
    'Go to experience',
    'Go to projects',
    'Go to skills',
    'Go to about',
    'Go to contact',
  ].forEach((label) => expect(options.getByRole('option', { name: label })).toBeVisible())

  expect(screen.getByRole('navigation', { name: 'Portfolio sections' })).toBeVisible()
})

test('runs section commands by aligning the hash, active status, and destination focus', () => {
  window.history.replaceState(null, '', '/')
  render(<App />)

  const contact = screen.getByRole('region', { name: /let’s work together/i })
  const offscreenTrigger = within(contact).getByRole('link', { name: /download pdf/i })
  const projects = screen.getByRole('region', { name: /selected projects/i })
  const focus = vi.spyOn(projects, 'focus')

  offscreenTrigger.focus()
  expect(offscreenTrigger).toHaveFocus()
  fireEvent.keyDown(window, { key: ':' })

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'projects' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(window.location.hash).toBe('#projects')
  expect(projects).toHaveFocus()
  expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  expect(offscreenTrigger).not.toHaveFocus()
})

test('explicitly scrolls an already-current section into view before focusing it', () => {
  window.history.replaceState(null, '', '/#projects')
  render(<App />)

  const projects = screen.getByRole('region', { name: /selected projects/i })
  const scrollIntoView = vi.fn()
  const focus = vi.spyOn(projects, 'focus')
  Object.defineProperty(projects, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  })

  fireEvent.keyDown(window, { key: ':' })
  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'projects' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(window.location.hash).toBe('#projects')
  expect(scrollIntoView).toHaveBeenCalledOnce()
  expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  expect(scrollIntoView.mock.invocationCallOrder[0]).toBeLessThan(
    focus.mock.invocationCallOrder[0],
  )
  expect(projects).toHaveFocus()
})

test.each([
  ['resume', 'Download resume'],
  ['linkedin', 'Open LinkedIn'],
  ['shortcut help', 'Show keyboard shortcuts'],
] as const)('restores the invoking focus after running the %s command', (query, optionName) => {
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  vi.spyOn(window, 'open').mockImplementation(() => null)
  vi.spyOn(window, 'alert').mockImplementation(() => undefined)
  render(<App />)

  const trigger = within(screen.getByRole('banner')).getByRole('link', {
    name: /download resume/i,
  })
  trigger.focus()
  fireEvent.keyDown(window, { key: ':' })

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: query } })
  expect(screen.getByRole('option', { name: optionName })).toBeVisible()
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})

test('triggers the existing resume download from its command', () => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  render(<App />)
  fireEvent.keyDown(window, { key: ':' })

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'resume' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(click).toHaveBeenCalledOnce()
  click.mockRestore()
})

test('opens external contact destinations from commands', () => {
  const open = vi.spyOn(window, 'open').mockImplementation(() => null)
  render(<App />)
  fireEvent.keyDown(window, { key: ':' })

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'linkedin' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(open).toHaveBeenCalledWith(
    'https://www.linkedin.com/in/casey-franceschy-694823124/',
    '_blank',
    'noopener,noreferrer',
  )
  open.mockRestore()
})

test('advertises optional shortcuts and provides a shortcut-help command', () => {
  const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined)
  render(<App />)

  expect(screen.getByText('Commands: : or Command/Ctrl+K (optional)')).toBeVisible()

  fireEvent.keyDown(window, { key: ':' })
  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'shortcut help' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(alert).toHaveBeenCalledWith(
    'Open commands with : or Command/Ctrl+K. Vim scroll shortcuts are enabled and can be disabled from this command palette. Scroll with j/k, Ctrl+d/Ctrl+u, gg (top), and G (bottom). Use the arrow keys to choose, Enter to run, and Escape to close.',
  )
  alert.mockRestore()
})

test('ignores Vim motion keys while command mode is open', () => {
  const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined)
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  )
  render(<App />)

  fireEvent.keyDown(window, { key: 'j' })
  expect(scrollBy).toHaveBeenCalledWith({ behavior: 'smooth', top: 72 })

  fireEvent.keyDown(window, { key: ':' })
  expect(screen.getByRole('dialog', { name: 'Portfolio commands' })).toBeVisible()
  fireEvent.keyDown(window, { key: 'j' })

  expect(scrollBy).toHaveBeenCalledOnce()
})

test('restores the disabled preference and leaves every Vim motion untouched', () => {
  const storage = createMemoryStorage()
  storage.setItem(vimShortcutsStorageKey, 'false')
  vi.stubGlobal('localStorage', storage)
  const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined)
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
  render(<App />)

  expect(screen.getByText('Vim scroll keys: Off')).toBeVisible()

  expect(fireEvent.keyDown(window, { key: 'j' })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'k' })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'd', ctrlKey: true })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'u', ctrlKey: true })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'g' })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'g' })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'G' })).toBe(true)
  expect(scrollBy).not.toHaveBeenCalled()
  expect(scrollTo).not.toHaveBeenCalled()

  fireEvent.keyDown(window, { key: ':' })
  expect(screen.getByRole('option', { name: 'Enable Vim scroll shortcuts' })).toBeVisible()
})

test('toggles Vim shortcuts from the command palette and persists each update', () => {
  const storage = createMemoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  )
  const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined)
  render(<App />)

  expect(screen.getByText('Vim scroll keys: On')).toHaveAttribute('aria-live', 'polite')
  fireEvent.keyDown(window, { key: ':' })
  let input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'disable vim' } })
  expect(screen.getByRole('option', { name: 'Disable Vim scroll shortcuts' })).toBeVisible()
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(storage.getItem(vimShortcutsStorageKey)).toBe('false')
  expect(screen.getByText('Vim scroll keys: Off')).toBeVisible()
  expect(fireEvent.keyDown(window, { key: 'd', ctrlKey: true })).toBe(true)
  expect(scrollBy).not.toHaveBeenCalled()

  fireEvent.keyDown(window, { key: ':' })
  input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'enable vim' } })
  expect(screen.getByRole('option', { name: 'Enable Vim scroll shortcuts' })).toBeVisible()
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(storage.getItem(vimShortcutsStorageKey)).toBe('true')
  expect(screen.getByText('Vim scroll keys: On')).toBeVisible()
  expect(fireEvent.keyDown(window, { key: 'j' })).toBe(false)
  expect(scrollBy).toHaveBeenCalledWith({ behavior: 'smooth', top: 72 })
})
