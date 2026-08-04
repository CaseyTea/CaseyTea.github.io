import { useCallback, useRef, useState } from 'react'

export const VIM_SHORTCUTS_STORAGE_KEY = 'portfolio:vim-scroll-shortcuts-enabled'

function readStoredPreference() {
  try {
    const storedPreference = window.localStorage.getItem(VIM_SHORTCUTS_STORAGE_KEY)

    if (storedPreference === 'false') return false
    if (storedPreference === 'true') return true
  } catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }

  return true
}

function storePreference(enabled: boolean) {
  try {
    window.localStorage.setItem(VIM_SHORTCUTS_STORAGE_KEY, String(enabled))
  } catch {
    // The current in-memory choice still applies when persistence is unavailable.
  }
}

export function useVimShortcutsPreference() {
  const [enabled, setEnabled] = useState(readStoredPreference)
  const enabledRef = useRef(enabled)

  const toggle = useCallback(() => {
    const nextEnabled = !enabledRef.current
    enabledRef.current = nextEnabled
    setEnabled(nextEnabled)
    storePreference(nextEnabled)
  }, [])

  return { enabled, toggle }
}
