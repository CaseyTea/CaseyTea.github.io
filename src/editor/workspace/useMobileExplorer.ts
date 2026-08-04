import { useCallback, useEffect, useRef, useState } from 'react'

const mobileExplorerQuery = '(max-width: 48rem)'

function getIsMobileExplorer(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(mobileExplorerQuery).matches
}

export function useMobileExplorer() {
  const openerRef = useRef<HTMLButtonElement>(null)
  const [isMobile, setIsMobile] = useState(getIsMobileExplorer)
  const [isOpen, setIsOpen] = useState(false)

  const openExplorer = useCallback(() => setIsOpen(true), [])
  const closeAfterSelection = useCallback(() => setIsOpen(false), [])
  const dismissExplorer = useCallback(() => {
    setIsOpen(false)
    openerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const mediaQuery = window.matchMedia(mobileExplorerQuery)
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
      if (!event.matches) setIsOpen(false)
    }

    setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      event.preventDefault()
      dismissExplorer()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dismissExplorer, isOpen])

  return {
    isMobile,
    isOpen,
    openerRef,
    openExplorer,
    dismissExplorer,
    closeAfterSelection,
  }
}
