import { useEffect, useRef } from 'react'

const SEQUENCE_WINDOW_MS = 500
const INTERACTIVE_SELECTOR = [
  'input',
  'textarea',
  'select',
  'button',
  'a',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"]):not(#active-buffer)',
].join(', ')

export type VimEasterEgg = 'ZZ' | 'i'

export type VimInterpreterOptions = {
  vimEnabled: boolean
  isCommandOpen: boolean
  isSearchOpen: boolean
  moveLines: (delta: number) => void
  moveHalfPage: (direction: 1 | -1) => void
  moveBoundary: (edge: 'first' | 'last') => void
  activateLine: () => void
  cycleBuffer: (direction: 1 | -1) => void
  openPrimaryBuffer: (position: number) => void
  onEasterEgg: (command: VimEasterEgg) => void
  onOpenSearch?: () => void
  onOpenCommand?: () => void
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest(INTERACTIVE_SELECTOR))
}

function isWithinSequence(timestamp: number | null, now: number): boolean {
  return timestamp !== null && now - timestamp <= SEQUENCE_WINDOW_MS
}

export function useVimInterpreter(options: VimInterpreterOptions): void {
  const optionsRef = useRef(options)
  const pendingGAt = useRef<number | null>(null)
  const pendingZAt = useRef<number | null>(null)
  optionsRef.current = options
  const unavailable =
    !options.vimEnabled || options.isCommandOpen || options.isSearchOpen

  useEffect(() => {
    const clearPending = () => {
      pendingGAt.current = null
      pendingZAt.current = null
    }

    clearPending()
    if (unavailable) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || isInteractiveTarget(event.target)) {
        clearPending()
        return
      }

      if (event.altKey || event.metaKey) {
        clearPending()
        return
      }

      if (
        event.repeat &&
        (pendingGAt.current !== null || pendingZAt.current !== null || event.key === 'g' || event.key === 'Z')
      ) {
        clearPending()
        return
      }

      const currentOptions = optionsRef.current

      if (event.ctrlKey) {
        const controlKey = event.key.toLocaleLowerCase()
        if (!event.shiftKey && (controlKey === 'd' || controlKey === 'u')) {
          event.preventDefault()
          clearPending()
          currentOptions.moveHalfPage(controlKey === 'd' ? 1 : -1)
          return
        }

        clearPending()
        return
      }

      const now = Date.now()

      if (pendingGAt.current !== null) {
        const completesSequence = isWithinSequence(pendingGAt.current, now)
        pendingGAt.current = null

        if (completesSequence && event.key === 'g' && !event.shiftKey) {
          event.preventDefault()
          currentOptions.moveBoundary('first')
          return
        }

        if (completesSequence && event.key === 't' && !event.shiftKey) {
          event.preventDefault()
          currentOptions.cycleBuffer(1)
          return
        }

        if (completesSequence && event.key === 'T') {
          event.preventDefault()
          currentOptions.cycleBuffer(-1)
          return
        }
      }

      if (pendingZAt.current !== null) {
        const completesSequence = isWithinSequence(pendingZAt.current, now)
        pendingZAt.current = null

        if (completesSequence && event.key === 'Z') {
          event.preventDefault()
          currentOptions.onEasterEgg('ZZ')
          return
        }
      }

      if (event.key === 'g' && !event.shiftKey) {
        pendingGAt.current = now
        pendingZAt.current = null
        return
      }

      if (event.key === 'Z') {
        pendingZAt.current = now
        pendingGAt.current = null
        return
      }

      clearPending()

      if (!event.shiftKey && (event.key === 'j' || event.key === 'k')) {
        event.preventDefault()
        currentOptions.moveLines(event.key === 'j' ? 1 : -1)
        return
      }

      if (event.key === 'G') {
        event.preventDefault()
        currentOptions.moveBoundary('last')
        return
      }

      if (!event.shiftKey && /^[1-7]$/.test(event.key)) {
        event.preventDefault()
        currentOptions.openPrimaryBuffer(Number(event.key))
        return
      }

      if (!event.shiftKey && event.key === 'Enter') {
        event.preventDefault()
        currentOptions.activateLine()
        return
      }

      if (!event.shiftKey && event.key === 'i') {
        event.preventDefault()
        currentOptions.onEasterEgg('i')
        return
      }

      if (!event.shiftKey && event.key === '/' && currentOptions.onOpenSearch) {
        event.preventDefault()
        currentOptions.onOpenSearch()
        return
      }

      if (event.key === ':' && currentOptions.onOpenCommand) {
        event.preventDefault()
        currentOptions.onOpenCommand()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [unavailable])
}
