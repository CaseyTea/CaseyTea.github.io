import { useEffect, useMemo, useRef } from 'react'
import type { Command } from '../../data/types'
import {
  filterCommands,
  useCommandPalette,
  type CommandSubmission,
} from './useCommandPalette'

type CommandPaletteProps = {
  commands: Command[]
  disabled?: boolean
  onSubmit?: (query: string, hasActiveCommand: boolean) => CommandSubmission
  onOpenChange?: (isOpen: boolean) => void
}

export function CommandPalette({
  commands,
  disabled,
  onSubmit,
  onOpenChange,
}: CommandPaletteProps) {
  const {
    isOpen,
    query,
    activeIndex,
    close,
    runCommand,
    setQuery,
    setActiveIndex,
  } = useCommandPalette(commands, { disabled, onSubmit })
  const inputRef = useRef<HTMLInputElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const matchingCommands = useMemo(() => filterCommands(commands, query), [commands, query])
  const activeCommand = matchingCommands[activeIndex]

  useEffect(() => {
    onOpenChange?.(isOpen)
  }, [isOpen, onOpenChange])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !activeCommand) return

    document.getElementById(`command-option-${activeCommand.id}`)?.scrollIntoView?.({
      block: 'nearest',
    })
  }, [activeCommand, isOpen])

  if (!isOpen) return null

  return (
    <div
      className="command-palette__backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          event.preventDefault()
          close()
        }
      }}
    >
      <div
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return

          if (!event.shiftKey && document.activeElement === inputRef.current) {
            event.preventDefault()
            closeButtonRef.current?.focus()
          } else if (event.shiftKey && document.activeElement === closeButtonRef.current) {
            event.preventDefault()
            inputRef.current?.focus()
          }
        }}
      >
        <div className="command-palette__header">
          <div>
            <p className="command-palette__eyebrow">Command mode</p>
            <h2 id="command-palette-title">Portfolio commands</h2>
          </div>
          <button
            ref={closeButtonRef}
            className="command-palette__close"
            type="button"
            onClick={close}
          >
            Close <kbd>Esc</kbd>
          </button>
        </div>

        <label className="command-palette__search">
          <span className="command-palette__label" aria-hidden="true">
            Find a command
          </span>
          <span className="command-palette__prompt" aria-hidden="true">
            :
          </span>
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-label="Find a command"
            aria-autocomplete="list"
            aria-controls="command-palette-options"
            aria-expanded="true"
            aria-activedescendant={
              activeCommand ? `command-option-${activeCommand.id}` : undefined
            }
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e README.md · help · resume · vim off"
          />
        </label>

        {matchingCommands.length > 0 ? (
          <ul
            className="command-palette__options"
            id="command-palette-options"
            role="listbox"
            aria-label="Available commands"
          >
            {matchingCommands.map((command, index) => (
              <li
                className="command-palette__option"
                id={`command-option-${command.id}`}
                role="option"
                aria-selected={index === activeIndex}
                key={command.id}
                onClick={() => runCommand(command)}
                onMouseMove={() => setActiveIndex(index)}
              >
                <span>{command.label}</span>
                <kbd aria-hidden="true">↵</kbd>
              </li>
            ))}
          </ul>
        ) : (
          <p className="command-palette__empty" role="status">
            No matching commands.
          </p>
        )}

        <p className="command-palette__hint">Use ↑ and ↓ to choose, then Enter to run.</p>
      </div>
    </div>
  )
}
