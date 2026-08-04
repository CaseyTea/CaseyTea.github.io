import { fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, vi } from 'vitest'
import { portfolioData } from '../data/portfolio'
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
  window.history.replaceState(null, '', '/')
  vi.stubGlobal('localStorage', createMemoryStorage())
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test('starts in the README editor buffer with conventional file navigation', () => {
  render(<App />)

  expect(screen.getByRole('navigation', { name: 'Files' })).toBeVisible()
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'README.md')
  expect(screen.getByRole('heading', { level: 1, name: 'Casey Franceschy' })).toHaveFocus()
  expect(screen.getByRole('button', { name: 'experience.log' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'View experience' })).toBeVisible()
  expect(screen.queryByRole('navigation', { name: 'Portfolio sections' })).not.toBeInTheDocument()
})

test('opens a selected portfolio document from the explorer', () => {
  render(<App />)

  fireEvent.click(screen.getByRole('button', { name: 'experience.log' }))

  expect(window.location.hash).toBe('#buffer=experience.log')
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'experience.log')
  expect(screen.getByRole('heading', { level: 1, name: 'Experience' })).toHaveFocus()
  expect(screen.getByRole('heading', { name: 'Quality Engineer (Intern)' })).toBeVisible()
})

test('opens Experience and Projects from README primary actions', () => {
  render(<App />)

  fireEvent.click(screen.getByRole('button', { name: 'View experience' }))
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'experience.log')

  fireEvent.click(screen.getByRole('button', { name: 'README.md' }))
  fireEvent.click(screen.getByRole('button', { name: 'Browse projects' }))
  expect(screen.getByRole('main')).toHaveAttribute(
    'aria-label',
    'projects/username-generator-api.md',
  )
})

test('uses plain Resume terminology in visitor-facing app copy and metadata', () => {
  render(<App />)
  fireEvent.keyDown(window, { key: ':' })

  expect(document.body.textContent).not.toMatch(/résumé/i)

  const metadata = readFileSync('index.html', 'utf8')
  expect(metadata).not.toMatch(/résumé/i)
})

test('renders Casey’s role and semantic resume links', () => {
  render(<App />)

  const banner = screen.getByRole('banner')
  expect(within(banner).getByText(portfolioData.name)).toBeVisible()
  expect(within(banner).getByText(portfolioData.title)).toBeVisible()
  expect(within(banner).getByRole('link', { name: 'Download resume' })).toHaveAttribute(
    'href',
    portfolioData.resumeUrl,
  )
  expect(screen.getAllByRole('link', { name: 'Download resume' })).toHaveLength(2)
})

test('provides editor landmarks, selected-heading skip navigation, and every real buffer', () => {
  render(<App />)

  const heading = screen.getByRole('heading', { level: 1, name: portfolioData.name })
  expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute(
    'href',
    `#${heading.id}`,
  )
  expect(screen.getByRole('banner')).toBeVisible()
  expect(screen.getByRole('navigation', { name: 'Files' })).toBeVisible()
  expect(screen.getByRole('main')).toHaveAttribute('id', 'active-buffer')
  expect(screen.getByRole('contentinfo', { name: 'Editor status' })).toBeVisible()

  ;[
    'README.md',
    'experience.log',
    'projects/username-generator-api.md',
    'projects/guess-that-ascii-mon.md',
    'projects/mockbot.md',
    'about.md',
    'contact.md',
    'help.txt',
  ].forEach((path) => expect(screen.getByRole('button', { name: path })).toBeVisible())
})

test('identifies the active buffer and follows hash changes', () => {
  window.history.replaceState(null, '', '/#buffer=contact.md')
  render(<App />)

  expect(screen.getByRole('button', { name: 'contact.md' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'contact.md')

  window.history.replaceState(null, '', '/#buffer=about.md')
  fireEvent(window, new HashChangeEvent('hashchange'))

  expect(screen.getByRole('button', { name: 'about.md' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'about.md')
})

test('shows all three real career metrics on README', () => {
  render(<App />)

  const metrics = screen.getByRole('list', { name: 'Career impact' })
  portfolioData.metrics.forEach(({ label, value }) => {
    expect(within(metrics).getByText(value)).toBeVisible()
    expect(within(metrics).getByText(label)).toBeVisible()
  })
})

test('points every visible resume action to the PDF asset', () => {
  render(<App />)

  screen.getAllByRole('link', { name: /download resume/i }).forEach((action) => {
    expect(action).toHaveAttribute('href', portfolioData.resumeUrl)
    expect(action).toHaveAttribute('download')
  })
})

test('renders evidence-backed skill groups in the About buffer without ratings', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'about.md' }))

  const about = screen.getByRole('article', { name: `About ${portfolioData.name}` })
  portfolioData.skillGroups.forEach(({ skills, title }) => {
    expect(within(about).getByRole('heading', { name: title })).toBeVisible()
    skills.forEach((skill) => expect(within(about).getByText(skill)).toBeVisible())
  })
  expect(within(about).queryByRole('progressbar')).not.toBeInTheDocument()
  expect(about.querySelector('meter')).not.toBeInTheDocument()
})

test('provides contact channels, verified location, and no contact form', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'contact.md' }))

  const contact = screen.getByRole('article', { name: 'Contact' })
  portfolioData.contacts.forEach(({ href, label }) =>
    expect(within(contact).getByRole('link', { name: label })).toHaveAttribute('href', href),
  )
  expect(within(contact).getByText(portfolioData.location)).toBeVisible()
  expect(contact.querySelector('form')).not.toBeInTheDocument()
})

test('renders project evidence and only links available for each selected project', () => {
  render(<App />)

  fireEvent.click(screen.getByRole('button', { name: 'projects/username-generator-api.md' }))
  let project = screen.getByRole('article', { name: 'Username Generator API' })
  expect(within(project).getByText(/collision-free usernames/i)).toBeVisible()
  expect(within(project).getByRole('img')).toHaveAttribute(
    'src',
    '/assets/projects/project-usernamegen.png',
  )
  expect(within(project).queryByRole('link')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'projects/guess-that-ascii-mon.md' }))
  project = screen.getByRole('article', { name: 'GuessThatAsciiMon' })
  expect(within(project).getByRole('link', { name: 'View live project' })).toHaveAttribute(
    'href',
    portfolioData.projects[1].demoUrl,
  )
  expect(within(project).queryByRole('link', { name: 'View source' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'projects/mockbot.md' }))
  project = screen.getByRole('article', { name: 'MockBot' })
  expect(within(project).getByRole('link', { name: 'View source' })).toHaveAttribute(
    'href',
    portfolioData.projects[2].sourceUrl,
  )
  expect(within(project).queryByRole('link', { name: 'View live project' })).not.toBeInTheDocument()
})

test('offers commands for every portfolio destination alongside file navigation', () => {
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

  expect(screen.getByRole('navigation', { name: 'Files' })).toBeVisible()
})

test('runs destination commands by aligning the hash, current file, and heading focus', () => {
  const focus = vi.spyOn(HTMLElement.prototype, 'focus')
  render(<App />)

  fireEvent.keyDown(window, { key: ':' })
  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'projects' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(window.location.hash).toBe('#buffer=username-generator-api.md')
  expect(screen.getByRole('main')).toHaveAttribute(
    'aria-label',
    'projects/username-generator-api.md',
  )
  expect(screen.getByRole('heading', { name: 'Username Generator API' })).toHaveFocus()
  expect(focus).toHaveBeenCalledWith({ preventScroll: true })
})

test('opens buffer aliases typed as editor commands and transfers heading focus', () => {
  render(<App />)
  fireEvent.keyDown(window, { key: ':' })

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: ':e experience.log' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'experience.log')
  expect(screen.getByRole('heading', { level: 1, name: 'Experience' })).toHaveFocus()
})

test('opens help through a typed editor command', () => {
  render(<App />)
  fireEvent.keyDown(window, { key: ':' })

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: ':help' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'help.txt')
  expect(screen.getByRole('heading', { level: 1, name: 'Help' })).toHaveFocus()
})

test('keeps the current buffer and reports an invalid typed editor command', () => {
  render(<App />)
  fireEvent.keyDown(window, { key: ':' })

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: ':make-coffee' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'README.md')
  expect(screen.getByRole('status')).toHaveTextContent(
    'not an editor command: make-coffee',
  )
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
})

test('opens external contact destinations from commands', () => {
  const open = vi.spyOn(window, 'open').mockImplementation(() => null)
  render(<App />)
  fireEvent.keyDown(window, { key: ':' })

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'linkedin' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(open).toHaveBeenCalledWith(
    portfolioData.contacts[2].href,
    '_blank',
    'noopener,noreferrer',
  )
})

test('provides shortcut help through both conventional and command controls', () => {
  const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined)
  render(<App />)

  fireEvent.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }))
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'help.txt')
  expect(screen.getByText(/Mouse, touch, Tab, and Enter/i)).toBeVisible()

  fireEvent.keyDown(window, { key: ':' })
  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'shortcut help' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(alert).toHaveBeenCalledWith(
    'Open commands with : or Command/Ctrl+K. Vim scroll shortcuts are enabled and can be disabled from this command palette. Scroll with j/k, Ctrl+d/Ctrl+u, gg (top), and G (bottom). Use the arrow keys to choose, Enter to run, and Escape to close.',
  )
})

test('moves the active line until command mode opens, then leaves it in place', () => {
  render(<App />)

  expect(document.querySelector('[data-editor-line-id="readme-line-1"]')).toHaveAttribute(
    'aria-current',
    'true',
  )
  fireEvent.keyDown(window, { key: 'j' })
  expect(document.querySelector('[data-editor-line-id="readme-line-2"]')).toHaveAttribute(
    'aria-current',
    'true',
  )

  fireEvent.keyDown(window, { key: ':' })
  expect(screen.getByRole('dialog', { name: 'Portfolio commands' })).toBeVisible()
  fireEvent.keyDown(window, { key: 'j' })

  expect(document.querySelector('[data-editor-line-id="readme-line-2"]')).toHaveAttribute(
    'aria-current',
    'true',
  )
})

test('supports active-line boundaries and activation without replacing conventional controls', () => {
  render(<App />)

  fireEvent.keyDown(window, { key: 'G', shiftKey: true })
  expect(document.querySelector('[data-editor-line-id="readme-line-9"]')).toHaveAttribute(
    'aria-current',
    'true',
  )

  fireEvent.keyDown(window, { key: 'g' })
  fireEvent.keyDown(window, { key: 'g' })
  for (let index = 0; index < 5; index += 1) fireEvent.keyDown(window, { key: 'j' })
  expect(document.querySelector('[data-editor-line-id="readme-line-6"]')).toHaveAttribute(
    'aria-current',
    'true',
  )

  fireEvent.keyDown(window, { key: 'Enter' })
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'experience.log')
  expect(screen.getByRole('button', { name: 'README.md' })).toBeVisible()
})

test('opens primary buffers by number and cycles only through open buffers', () => {
  render(<App />)

  fireEvent.keyDown(window, { key: '3' })
  expect(screen.getByRole('main')).toHaveAttribute(
    'aria-label',
    'projects/username-generator-api.md',
  )

  fireEvent.keyDown(window, { key: 'g' })
  fireEvent.keyDown(window, { key: 't' })
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'README.md')

  fireEvent.keyDown(window, { key: 'g' })
  fireEvent.keyDown(window, { key: 'T', shiftKey: true })
  expect(screen.getByRole('main')).toHaveAttribute(
    'aria-label',
    'projects/username-generator-api.md',
  )
})

test('reports harmless insert and write-quit easter eggs in the editor status', () => {
  render(<App />)

  fireEvent.keyDown(window, { key: 'i' })
  expect(screen.getByRole('status')).toHaveTextContent('portfolio is read-only')

  fireEvent.keyDown(window, { key: 'Z', shiftKey: true })
  fireEvent.keyDown(window, { key: 'Z', shiftKey: true })
  expect(screen.getByRole('status')).toHaveTextContent('portfolio already saved')
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'README.md')
})

test.each([
  [':w', 'portfolio already saved'],
  [':q', "close this tab whenever you're ready"],
] as const)('reports harmless typed command %s through editor status', (command, message) => {
  render(<App />)
  fireEvent.keyDown(window, { key: ':' })

  const input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: command } })
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(screen.getByRole('status')).toHaveTextContent(message)
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'README.md')
})

test('restores the disabled preference and leaves every Vim motion untouched', () => {
  const storage = createMemoryStorage()
  storage.setItem(vimShortcutsStorageKey, 'false')
  vi.stubGlobal('localStorage', storage)
  render(<App />)

  expect(screen.getByRole('button', { name: 'Editor keys: off' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  expect(screen.getByText('-- READING --')).toBeVisible()

  expect(fireEvent.keyDown(window, { key: 'j' })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'k' })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'd', ctrlKey: true })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'u', ctrlKey: true })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'g' })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'g' })).toBe(true)
  expect(fireEvent.keyDown(window, { key: 'G' })).toBe(true)
  expect(document.querySelector('[data-editor-line-id="readme-line-1"]')).toHaveAttribute(
    'aria-current',
    'true',
  )

  fireEvent.keyDown(window, { key: ':' })
  expect(screen.getByRole('option', { name: 'Enable Vim scroll shortcuts' })).toBeVisible()
})

test('toggles Vim shortcuts from the command palette and persists each update', () => {
  const storage = createMemoryStorage()
  vi.stubGlobal('localStorage', storage)
  render(<App />)

  expect(screen.getByRole('button', { name: 'Editor keys: on' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  fireEvent.keyDown(window, { key: ':' })
  let input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'disable vim' } })
  expect(screen.getByRole('option', { name: 'Disable Vim scroll shortcuts' })).toBeVisible()
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(storage.getItem(vimShortcutsStorageKey)).toBe('false')
  expect(screen.getByRole('button', { name: 'Editor keys: off' })).toBeVisible()
  expect(fireEvent.keyDown(window, { key: 'd', ctrlKey: true })).toBe(true)
  expect(document.querySelector('[data-editor-line-id="readme-line-1"]')).toHaveAttribute(
    'aria-current',
    'true',
  )

  fireEvent.keyDown(window, { key: ':' })
  input = screen.getByRole('combobox', { name: 'Find a command' })
  fireEvent.change(input, { target: { value: 'enable vim' } })
  expect(screen.getByRole('option', { name: 'Enable Vim scroll shortcuts' })).toBeVisible()
  fireEvent.keyDown(input, { key: 'Enter' })

  expect(storage.getItem(vimShortcutsStorageKey)).toBe('true')
  expect(screen.getByRole('button', { name: 'Editor keys: on' })).toBeVisible()
  expect(fireEvent.keyDown(window, { key: 'j' })).toBe(false)
  expect(document.querySelector('[data-editor-line-id="readme-line-2"]')).toHaveAttribute(
    'aria-current',
    'true',
  )
})

test('searches the active buffer, suspends Vim motions, and restores its invoking line', () => {
  render(<App />)

  fireEvent.keyDown(window, { key: 'j' })
  fireEvent.keyDown(window, { key: 'j' })
  expect(document.querySelector('[data-editor-line-id="readme-line-3"]')).toHaveAttribute(
    'aria-current',
    'true',
  )

  expect(fireEvent.keyDown(window, { key: '/' })).toBe(false)
  const input = screen.getByRole('searchbox', { name: 'Search current buffer' })
  expect(input).toHaveFocus()
  expect(screen.getByText('-- SEARCH --')).toBeVisible()

  fireEvent.change(input, { target: { value: 'experience' } })
  const match = document.querySelector('[data-editor-line-id="readme-line-6"]')
  expect(match).toHaveClass('document-line--search-match')
  expect(match).toHaveAttribute('aria-current', 'true')
  expect(screen.getByText('1 of 1 matches')).toBeVisible()

  expect(fireEvent.keyDown(window, { key: 'j' })).toBe(true)
  expect(match).toHaveAttribute('aria-current', 'true')

  fireEvent.keyDown(input, { key: 'Escape' })
  expect(screen.queryByRole('searchbox', { name: 'Search current buffer' })).not.toBeInTheDocument()
  expect(document.querySelector('[data-editor-line-id="readme-line-3"]')).toHaveAttribute(
    'aria-current',
    'true',
  )
  expect(screen.getByRole('heading', { level: 1, name: portfolioData.name })).toHaveFocus()
})

test('keeps command and search modes separate while suppressing Vim input', () => {
  const { unmount } = render(<App />)

  fireEvent.keyDown(window, { key: '/' })
  expect(screen.getByRole('searchbox', { name: 'Search current buffer' })).toHaveFocus()
  expect(fireEvent.keyDown(window, { key: 'k', ctrlKey: true })).toBe(true)
  expect(screen.queryByRole('dialog', { name: 'Portfolio commands' })).not.toBeInTheDocument()
  expect(fireEvent.keyDown(window, { key: 'j' })).toBe(true)

  unmount()
  render(<App />)
  fireEvent.keyDown(window, { key: ':' })
  expect(screen.getByRole('dialog', { name: 'Portfolio commands' })).toBeVisible()
  expect(fireEvent.keyDown(window, { key: '/' })).toBe(true)
  expect(screen.queryByRole('searchbox', { name: 'Search current buffer' })).not.toBeInTheDocument()
})

test('reports a missing buffer pattern without moving the active line', () => {
  render(<App />)
  fireEvent.keyDown(window, { key: 'j' })

  fireEvent.keyDown(window, { key: '/' })
  const input = screen.getByRole('searchbox', { name: 'Search current buffer' })
  fireEvent.change(input, { target: { value: 'definitely absent' } })

  expect(screen.getByText('0 matches')).toBeVisible()
  expect(document.querySelector('[data-editor-line-id="readme-line-2"]')).toHaveAttribute(
    'aria-current',
    'true',
  )

  fireEvent.keyDown(input, { key: 'Escape' })
  expect(screen.getByRole('status')).toHaveTextContent(
    'pattern not found: definitely absent',
  )
  expect(document.querySelector('[data-editor-line-id="readme-line-2"]')).toHaveAttribute(
    'aria-current',
    'true',
  )
})

test('resets search when conventional file navigation changes the active buffer', () => {
  render(<App />)

  fireEvent.keyDown(window, { key: '/' })
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search current buffer' }), {
    target: { value: 'casey' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'experience.log' }))

  expect(screen.queryByRole('searchbox', { name: 'Search current buffer' })).not.toBeInTheDocument()
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'experience.log')
  expect(screen.getByRole('heading', { level: 1, name: 'Experience' })).toHaveFocus()
  expect(document.querySelector('[data-editor-line-id="experience-line-1"]')).toHaveAttribute(
    'aria-current',
    'true',
  )
})
