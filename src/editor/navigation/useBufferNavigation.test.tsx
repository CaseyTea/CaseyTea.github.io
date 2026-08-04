import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { createBufferRegistry } from '../buffers/createBufferRegistry'
import { portfolioData } from '../../data/portfolio'
import { parseBufferHash, useBufferNavigation } from './useBufferNavigation'

const registry = createBufferRegistry(portfolioData)

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  window.history.replaceState(null, '', '/')
})

test('parses default and buffer hash forms through the registry', () => {
  expect(parseBufferHash('#readme', registry)).toEqual({ id: 'readme', value: 'readme' })
  expect(parseBufferHash('#buffer=projects/guess-that-ascii-mon.md', registry)).toEqual({
    id: 'project-guess-that-ascii-mon',
    value: 'projects/guess-that-ascii-mon.md',
  })
})

test('treats a malformed percent-encoded buffer hash as unknown', () => {
  expect(() => parseBufferHash('#buffer=%E0', registry)).not.toThrow()
  expect(parseBufferHash('#buffer=%E0', registry)).toEqual({ id: null, value: '%E0' })
})

test('opens the buffer addressed by the initial hash', () => {
  window.history.replaceState(null, '', '#buffer=experience.log')

  const { result } = renderHook(() => useBufferNavigation(registry))

  expect(result.current.activeId).toBe('experience')
  expect(result.current.activeBuffer?.filename).toBe('experience.log')
  expect(result.current.openIds).toEqual(['readme', 'experience'])
})

test('falls back to README and reports an invalid initial hash', () => {
  window.history.replaceState(null, '', '#buffer=missing.md')

  const { result } = renderHook(() => useBufferNavigation(registry))

  expect(result.current.activeId).toBe('readme')
  expect(result.current.statusMessage).toBe('file not found: missing.md')
  expect(window.location.hash).toBe('')

  act(() => result.current.clearStatus())

  expect(result.current.statusMessage).toBeNull()
})

test('opens a buffer once and navigates using its filename hash', () => {
  const { result } = renderHook(() => useBufferNavigation(registry))
  const initialOpenEpoch = result.current.openEpoch

  act(() => result.current.openBuffer('contact'))

  expect(window.location.hash).toBe('#buffer=contact.md')
  expect(result.current.activeId).toBe('contact')
  expect(result.current.openIds).toEqual(['readme', 'experience', 'contact'])
  expect(result.current.openEpoch).toBe(initialOpenEpoch + 1)

  act(() => result.current.openBuffer('contact'))

  expect(result.current.openIds).toEqual(['readme', 'experience', 'contact'])
  expect(result.current.openEpoch).toBe(initialOpenEpoch + 2)
})

test('cycles forward and backward only through open buffers', () => {
  const { result } = renderHook(() => useBufferNavigation(registry))

  act(() => result.current.openBuffer('contact'))
  act(() => result.current.cycleBuffer(1))
  expect(result.current.activeId).toBe('readme')

  act(() => result.current.cycleBuffer(-1))
  expect(result.current.activeId).toBe('contact')
  expect(result.current.openIds).toEqual(['readme', 'experience', 'contact'])
})

test('treats a runtime unknown hash as a navigation event back to README', () => {
  const { result } = renderHook(() => useBufferNavigation(registry))
  const initialOpenEpoch = result.current.openEpoch

  window.history.replaceState(null, '', '/#buffer=missing.md')
  act(() => window.dispatchEvent(new HashChangeEvent('hashchange')))

  expect(window.location.hash).toBe('')
  expect(result.current.activeId).toBe('readme')
  expect(result.current.statusMessage).toBe('file not found: missing.md')
  expect(result.current.openEpoch).toBe(initialOpenEpoch + 1)
})
