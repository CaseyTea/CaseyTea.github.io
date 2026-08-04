import { portfolioData } from '../../data/portfolio'
import { createBufferRegistry } from './createBufferRegistry'

describe('createBufferRegistry', () => {
  const registry = createBufferRegistry(portfolioData)

  test('creates the complete deterministic primary buffer set from portfolio data', () => {
    expect(registry.defaultId).toBe('readme')
    expect(registry.primaryIds).toEqual([
      'readme',
      'experience',
      'project-username-generator-api',
      'project-guess-that-ascii-mon',
      'project-mockbot',
      'about',
      'contact',
      'help',
    ])
    expect(registry.byId.get('project-guess-that-ascii-mon')?.filename).toBe(
      'guess-that-ascii-mon.md',
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
