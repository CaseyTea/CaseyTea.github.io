import { useEffect, useRef } from 'react'

const LINE_SCROLL_DISTANCE = 72
const G_SEQUENCE_WINDOW_MS = 500

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false

  return Boolean(
    target.closest(
      'input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])',
    ),
  )
}

function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

export function useVimScrollMotions({ disabled }: { disabled: boolean }): void {
  const firstGAt = useRef<number | null>(null)

  useEffect(() => {
    firstGAt.current = null
    if (disabled) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || isInteractiveTarget(event.target)) {
        firstGAt.current = null
        return
      }

      const hasUnsupportedModifier = event.altKey || event.metaKey
      if (hasUnsupportedModifier) {
        firstGAt.current = null
        return
      }

      if (!event.ctrlKey && !event.shiftKey && (event.key === 'j' || event.key === 'k')) {
        event.preventDefault()
        firstGAt.current = null
        window.scrollBy({
          behavior: getScrollBehavior(),
          top: event.key === 'j' ? LINE_SCROLL_DISTANCE : -LINE_SCROLL_DISTANCE,
        })
        return
      }

      if (
        event.ctrlKey &&
        !event.shiftKey &&
        (event.key.toLocaleLowerCase() === 'd' || event.key.toLocaleLowerCase() === 'u')
      ) {
        event.preventDefault()
        firstGAt.current = null
        window.scrollBy({
          behavior: getScrollBehavior(),
          top:
            event.key.toLocaleLowerCase() === 'd'
              ? window.innerHeight / 2
              : -window.innerHeight / 2,
        })
        return
      }

      if (!event.ctrlKey && event.key === 'G') {
        event.preventDefault()
        firstGAt.current = null
        window.scrollTo({
          behavior: getScrollBehavior(),
          top: document.documentElement.scrollHeight,
        })
        return
      }

      if (!event.ctrlKey && !event.shiftKey && event.key === 'g' && !event.repeat) {
        const now = Date.now()
        const isSequence = firstGAt.current !== null && now - firstGAt.current <= G_SEQUENCE_WINDOW_MS

        if (isSequence) {
          event.preventDefault()
          firstGAt.current = null
          window.scrollTo({ behavior: getScrollBehavior(), top: 0 })
        } else {
          firstGAt.current = now
        }

        return
      }

      firstGAt.current = null
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled])
}
