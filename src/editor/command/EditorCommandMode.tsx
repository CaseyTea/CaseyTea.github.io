import { useCallback } from 'react'
import { CommandPalette } from '../../components/command/CommandPalette'
import type { Command } from '../../data/types'
import type { BufferId, BufferRegistry } from '../buffers/types'
import { parseEditorCommand } from './parseEditorCommand'

export type EditorCommandModeProps = {
  commands: Command[]
  registry: BufferRegistry
  isSearchOpen: boolean
  onOpenBuffer: (id: BufferId) => void
  onResume: () => void
  onSetVim: (enabled: boolean) => void
  onStatusMessage: (message: string) => void
  onOpenChange?: (isOpen: boolean) => void
}

export function EditorCommandMode({
  commands,
  registry,
  isSearchOpen,
  onOpenBuffer,
  onResume,
  onSetVim,
  onStatusMessage,
  onOpenChange,
}: EditorCommandModeProps) {
  const submitCommand = useCallback(
    (input: string, hasActiveCommand: boolean) => {
      const result = parseEditorCommand(input, registry)
      const explicitCommand = input.trim().startsWith(':')

      if (
        hasActiveCommand &&
        !explicitCommand &&
        (result.type === 'unknown' || input.trim().length === 0)
      ) {
        return { handled: false } as const
      }

      switch (result.type) {
        case 'open-buffer':
          onOpenBuffer(result.bufferId)
          return { handled: true, restoreInvokingFocus: false } as const
        case 'help':
          onOpenBuffer('help')
          return { handled: true, restoreInvokingFocus: false } as const
        case 'resume':
          onResume()
          return { handled: true } as const
        case 'set-vim':
          onSetVim(result.enabled)
          return { handled: true } as const
        case 'message':
        case 'unknown':
          onStatusMessage(result.message)
          return { handled: true } as const
      }
    },
    [onOpenBuffer, onResume, onSetVim, onStatusMessage, registry],
  )

  return (
    <CommandPalette
      commands={commands}
      disabled={isSearchOpen}
      onSubmit={submitCommand}
      onOpenChange={onOpenChange}
    />
  )
}
