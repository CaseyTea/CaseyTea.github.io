import type { BufferId, BufferRegistry } from '../buffers/types'

export type EditorCommandResult =
  | { type: 'open-buffer'; bufferId: BufferId }
  | { type: 'help' }
  | { type: 'resume' }
  | { type: 'set-vim'; enabled: boolean }
  | { type: 'message'; message: string }
  | { type: 'unknown'; message: string }

function normalizeInput(input: string): string {
  return input.trim().replace(/^:/, '').trim().replace(/\s+/g, ' ')
}

export function parseEditorCommand(
  input: string,
  registry: BufferRegistry,
): EditorCommandResult {
  const command = normalizeInput(input)

  if (!command) return { type: 'message', message: 'portfolio is read-only' }

  const [name, ...arguments_] = command.split(' ')
  const normalizedName = name.toLocaleLowerCase()

  if (normalizedName === 'e' && arguments_.length > 0) {
    const bufferId = registry.resolve(arguments_.join(' '))
    if (bufferId) return { type: 'open-buffer', bufferId }
  }

  if (normalizedName === 'help' && arguments_.length === 0) return { type: 'help' }
  if (normalizedName === 'resume' && arguments_.length === 0) return { type: 'resume' }

  if (normalizedName === 'vim' && arguments_.length === 1) {
    const preference = arguments_[0].toLocaleLowerCase()
    if (preference === 'on' || preference === 'off') {
      return { type: 'set-vim', enabled: preference === 'on' }
    }
  }

  if (normalizedName === 'w' && arguments_.length === 0) {
    return { type: 'message', message: 'portfolio already saved' }
  }

  if (normalizedName === 'q' && arguments_.length === 0) {
    return { type: 'message', message: "close this tab whenever you're ready" }
  }

  return { type: 'unknown', message: `not an editor command: ${command}` }
}
