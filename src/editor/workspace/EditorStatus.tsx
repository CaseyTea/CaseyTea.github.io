import type { ReactNode } from 'react'
import type { BufferDefinition } from '../buffers/types'

type EditorStatusProps = {
  activeBuffer: BufferDefinition
  vimEnabled: boolean
  statusMessage: string | null
  search?: ReactNode
  activeLineIndex?: number
  lineCount?: number
  isCommandOpen?: boolean
}

export function EditorStatus({
  activeBuffer,
  vimEnabled,
  statusMessage,
  search,
  activeLineIndex = 0,
  lineCount = 1,
  isCommandOpen = false,
}: EditorStatusProps) {
  const defaultMessage = vimEnabled
    ? 'j k move · ⏎ follow · : command · / search'
    : 'click a file, or turn editor keys on in the sidebar'
  const mode = search ? 'SEARCH' : isCommandOpen ? 'COMMAND' : vimEnabled ? 'NORMAL' : 'READING'
  const clampedIndex = Math.min(Math.max(activeLineIndex, 0), Math.max(lineCount - 1, 0))
  const position = lineCount <= 1 || clampedIndex === 0
    ? 'Top'
    : clampedIndex === lineCount - 1
      ? 'Bottom'
      : `${Math.round(((clampedIndex + 1) / lineCount) * 100)}%`

  return (
    <footer className="editor-status" aria-label="Editor status">
      <div className="editor-status__line">
        <span className="editor-status__mode">-- {mode} --</span>
        <span className="editor-status__file">{activeBuffer.path}</span>
        <span className="editor-status__spacer" aria-hidden="true" />
        <span className="editor-status__field">{activeBuffer.kind}</span>
        <span className="editor-status__field">{vimEnabled ? 'vim' : 'no-vim'}</span>
        <span className="editor-status__field">{clampedIndex + 1},1</span>
        <span className="editor-status__field editor-status__position">{position}</span>
      </div>
      <div className="editor-status__message">
        {search ?? (
          <span role="status" aria-live="polite" className={statusMessage ? 'is-active' : undefined}>
            {statusMessage ?? defaultMessage}
          </span>
        )}
      </div>
    </footer>
  )
}
