import type { BufferDefinition, BufferId, BufferRegistry } from '../buffers/types'

type ExplorerProps = {
  registry: BufferRegistry
  activeId: BufferId
  vimEnabled: boolean
  onOpenBuffer: (id: BufferId) => void
  onToggleVim: () => void
  className?: string
  hiddenFromAccessibility?: boolean
}

export function Explorer({
  registry,
  activeId,
  vimEnabled,
  onOpenBuffer,
  onToggleVim,
  className = '',
  hiddenFromAccessibility = false,
}: ExplorerProps) {
  const buffers = Array.from(registry.byId.values())
  const projectBuffers = buffers.filter((buffer) => buffer.path.includes('/'))
  const firstProjectIndex = buffers.findIndex((buffer) => buffer.path.includes('/'))

  const renderBufferButton = (buffer: BufferDefinition, nested = false) => {
    const isActive = buffer.id === activeId

    return (
      <button
        className={`editor-explorer__file${nested ? ' editor-explorer__file--nested' : ''}`}
        type="button"
        aria-label={buffer.path}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onOpenBuffer(buffer.id)}
      >
        <span aria-hidden="true" className="editor-explorer__marker">
          {isActive ? '›' : ''}
        </span>
        {buffer.filename}
      </button>
    )
  }

  return (
    <nav
      id="portfolio-explorer"
      className={`editor-explorer ${className}`.trim()}
      aria-label="Files"
      aria-hidden={hiddenFromAccessibility ? true : undefined}
      inert={hiddenFromAccessibility ? true : undefined}
    >
      <div className="editor-explorer__heading">Explorer</div>
      <ul className="editor-explorer__files" aria-label="Portfolio files">
        {buffers.map((buffer, index) => {
          if (!buffer.path.includes('/')) {
            return <li key={buffer.id}>{renderBufferButton(buffer)}</li>
          }

          if (index !== firstProjectIndex) return null

          return (
            <li key="projects" className="editor-explorer__folder">
              <div className="editor-explorer__folder-label">
                <span aria-hidden="true" className="editor-explorer__folder-marker">▾</span>
                <span>projects/</span>
              </div>
              <ul className="editor-explorer__folder-files" aria-label="projects folder">
                {projectBuffers.map((projectBuffer) => (
                  <li key={projectBuffer.id}>{renderBufferButton(projectBuffer, true)}</li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
      <div className="editor-explorer__settings">
        <button
          className="editor-vim-toggle"
          type="button"
          aria-pressed={vimEnabled}
          onClick={onToggleVim}
        >
          Editor keys: {vimEnabled ? 'on' : 'off'}
        </button>
        <p>Mouse and arrow keys work either way.</p>
      </div>
    </nav>
  )
}
