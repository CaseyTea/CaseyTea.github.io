import type { ReactNode } from 'react'
import type { BufferDefinition } from '../buffers/types'

type EditorStatusProps = {
  activeBuffer: BufferDefinition
  vimEnabled: boolean
  statusMessage: string | null
  search?: ReactNode
}

export function EditorStatus({
  activeBuffer,
  vimEnabled,
  statusMessage,
  search,
}: EditorStatusProps) {
  const defaultMessage = vimEnabled
    ? 'j k move · ⏎ follow · : command · / search'
    : 'click a file, or turn editor keys on in the sidebar'
  const mode = search ? 'SEARCH' : vimEnabled ? 'NORMAL' : 'READING'

  return (
    <footer className="editor-status" aria-label="Editor status">
      <div className="editor-status__line">
        <span className="editor-status__mode">-- {mode} --</span>
        <span className="editor-status__file">{activeBuffer.path}</span>
        <span className="editor-status__spacer" aria-hidden="true" />
        <span className="editor-status__field">{vimEnabled ? 'vim' : 'no-vim'}</span>
        <span className="editor-status__field">1,1</span>
        <span className="editor-status__field editor-status__position">Top</span>
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
