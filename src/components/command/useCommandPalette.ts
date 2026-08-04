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

export type CommandSubmission =
  | { handled: false }
  | { handled: true; restoreInvokingFocus?: boolean }

type CommandPaletteOptions = {
  disabled?: boolean
  onSubmit?: (query: string, hasActiveCommand: boolean) => CommandSubmission
}

export function useCommandPalette(
  commands: Command[],
  { disabled = false, onSubmit }: CommandPaletteOptions = {},
) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, updateQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)
  const matchingCommands = useMemo(() => filterCommands(commands, query), [commands, query])

  const open = useCallback(() => {
    if (disabled) return

    previouslyFocusedElement.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setIsOpen(true)
  }, [disabled])

  const reset = useCallback((restoreFocus: boolean) => {
    setIsOpen(false)
    updateQuery('')
    setActiveIndex(0)
    if (restoreFocus) previouslyFocusedElement.current?.focus({ preventScroll: true })
    previouslyFocusedElement.current = null
  }, [])

  const close = useCallback(() => reset(true), [reset])

  const runCommand = useCallback(
    (command: Command) => {
      command.run()
      reset(command.restoreInvokingFocus !== false)
    },
    [reset],
  )

  const setQuery = useCallback((value: string) => {
    updateQuery(value)
    setActiveIndex(0)
  }, [])

  const runActive = useCallback(() => {
    const activeCommand = matchingCommands[activeIndex]
    const submission = onSubmit?.(query, Boolean(activeCommand))

    if (submission?.handled) {
      reset(submission.restoreInvokingFocus !== false)
      return
    }

    if (!activeCommand) return

    runCommand(activeCommand)
  }, [activeIndex, matchingCommands, onSubmit, query, reset, runCommand])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) {
        if (disabled) return
        if (isEditableTarget(event.target)) return

        const opensWithColon =
          event.key === ':' && !event.altKey && !event.ctrlKey && !event.metaKey
        const opensWithCommandKey =
          event.key.toLocaleLowerCase() === 'k' &&
          (event.ctrlKey || event.metaKey) &&
          !event.altKey &&
          !event.shiftKey

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
  }, [close, disabled, isOpen, matchingCommands.length, open, runActive])

  return {
    isOpen,
    query,
    activeIndex,
    open,
    close,
    runCommand,
    setQuery,
    setActiveIndex,
    runActive,
  }
}
