import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import {
  VIM_SHORTCUTS_STORAGE_KEY,
  useVimShortcutsPreference,
} from './useVimShortcutsPreference'

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

test('enables Vim shortcuts by default and restores an explicitly disabled preference', () => {
  const { result, unmount } = renderHook(() => useVimShortcutsPreference())
  expect(result.current.enabled).toBe(true)

  unmount()
  window.localStorage.setItem(VIM_SHORTCUTS_STORAGE_KEY, 'false')
  const restored = renderHook(() => useVimShortcutsPreference())

  expect(restored.result.current.enabled).toBe(false)
})

test('persists preference updates for the next initialization', () => {
  const { result, unmount } = renderHook(() => useVimShortcutsPreference())

  act(() => result.current.toggle())

  expect(result.current.enabled).toBe(false)
  expect(window.localStorage.getItem(VIM_SHORTCUTS_STORAGE_KEY)).toBe('false')

  unmount()
  const restored = renderHook(() => useVimShortcutsPreference())
  expect(restored.result.current.enabled).toBe(false)

  act(() => restored.result.current.toggle())
  expect(restored.result.current.enabled).toBe(true)
  expect(window.localStorage.getItem(VIM_SHORTCUTS_STORAGE_KEY)).toBe('true')
})

test('falls back to enabled for corrupt or unavailable storage', () => {
  window.localStorage.setItem(VIM_SHORTCUTS_STORAGE_KEY, 'not-a-boolean')
  const corrupt = renderHook(() => useVimShortcutsPreference())
  expect(corrupt.result.current.enabled).toBe(true)
  corrupt.unmount()

  vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
    throw new Error('Storage unavailable')
  })
  const unavailable = renderHook(() => useVimShortcutsPreference())

  expect(unavailable.result.current.enabled).toBe(true)
})

test('updates the in-memory preference when storage writes are unavailable', () => {
  vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
    throw new Error('Storage unavailable')
  })
  const { result } = renderHook(() => useVimShortcutsPreference())

  act(() => result.current.toggle())

  expect(result.current.enabled).toBe(false)
})
