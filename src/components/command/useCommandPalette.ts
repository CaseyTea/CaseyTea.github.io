import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Command } from '../../data/types'

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false

  return Boolean(
    target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])'),
  )
}

export function filterCommands(commands: Command[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  if (!normalizedQuery) return commands

  const queryTerms = normalizedQuery.split(/\s+/)

  return commands.filter(({ keywords, label }) => {
    const searchableText = [label, ...keywords].join(' ').toLocaleLowerCase()
    return queryTerms.every((term) => searchableText.includes(term))
  })
}

export function useCommandPalette(commands: Command[]) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, updateQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)
  const matchingCommands = useMemo(() => filterCommands(commands, query), [commands, query])

  const open = useCallback(() => {
    previouslyFocusedElement.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    updateQuery('')
    setActiveIndex(0)
    previouslyFocusedElement.current?.focus()
  }, [])

  const setQuery = useCallback((value: string) => {
    updateQuery(value)
    setActiveIndex(0)
  }, [])

  const runActive = useCallback(() => {
    const activeCommand = matchingCommands[activeIndex]

    if (!activeCommand) return

    activeCommand.run()
    close()
  }, [activeIndex, close, matchingCommands])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) {
        if (isEditableTarget(event.target)) return

        const opensWithColon =
          event.key === ':' && !event.altKey && !event.ctrlKey && !event.metaKey
        const opensWithCommandKey =
          event.key.toLocaleLowerCase() === 'k' &&
          (event.ctrlKey || event.metaKey) &&
          !event.altKey

        if (opensWithColon || opensWithCommandKey) {
          event.preventDefault()
          open()
        }

        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }

      const isCommandInput =
        event.target instanceof HTMLInputElement &&
        event.target.getAttribute('role') === 'combobox'

      if (!isCommandInput) return

      if (event.key === 'ArrowDown' && matchingCommands.length > 0) {
        event.preventDefault()
        setActiveIndex((current) => (current + 1) % matchingCommands.length)
        return
      }

      if (event.key === 'ArrowUp' && matchingCommands.length > 0) {
        event.preventDefault()
        setActiveIndex((current) =>
          current === 0 ? matchingCommands.length - 1 : current - 1,
        )
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        runActive()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close, isOpen, matchingCommands.length, open, runActive])

  return {
    isOpen,
    query,
    activeIndex,
    open,
    close,
    setQuery,
    setActiveIndex,
    runActive,
  }
}
