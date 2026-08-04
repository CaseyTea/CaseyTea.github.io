import { portfolioData } from '../../data/portfolio'
import { createBufferRegistry } from './createBufferRegistry'

describe('createBufferRegistry', () => {
  const registry = createBufferRegistry(portfolioData)

  test('creates seven keyboard-addressable buffers in deterministic order', () => {
    expect(registry.defaultId).toBe('readme')
    expect(registry.primaryIds).toEqual([
      'readme',
      'experience',
      'project-username-generator-api',
      'project-guess-that-ascii-mon',
      'project-mockbot',
      'about',
      'contact',
    ])
    expect(registry.byId.get('project-guess-that-ascii-mon')?.filename).toBe(
      'guess-that-ascii-mon.md',
    )
    expect(registry.byId.get('help')?.searchText).toContain(
      '1 README.md 2 experience.log 3 username-generator-api.md 4 guess-that-ascii-mon.md 5 mockbot.md 6 about.md 7 contact.md',
    )
  })

  test('resolves editor aliases, paths, filenames, IDs, and project names', () => {
    expect(registry.resolve('README.md')).toBe('readme')
    expect(registry.resolve(':e experience')).toBe('experience')
    expect(registry.resolve('experience.log')).toBe('experience')
    expect(registry.resolve('projects/guess-that-ascii-mon.md')).toBe(
      'project-guess-that-ascii-mon',
    )
    expect(registry.resolve('GuessThatAsciiMon')).toBe('project-guess-that-ascii-mon')
    expect(registry.resolve('guess-that-ascii-mon')).toBe('project-guess-that-ascii-mon')
  })

  test('contains only factual, complete text ready for editor rendering', () => {
    expect(JSON.stringify([...registry.byId.values()])).not.toMatch(/needs:|\[\[|TBD|TODO/i)
  })
})
