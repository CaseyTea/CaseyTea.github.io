import type { BufferId, BufferRegistry } from '../buffers/types'

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
  return (
    <nav
      id="portfolio-explorer"
      className={`editor-explorer ${className}`.trim()}
      aria-label="Files"
      aria-hidden={hiddenFromAccessibility ? true : undefined}
      inert={hiddenFromAccessibility ? true : undefined}
    >
      <div className="editor-explorer__heading">Explorer</div>
      <div className="editor-explorer__files">
        {Array.from(registry.byId.values()).map((buffer) => {
          const isActive = buffer.id === activeId

          return (
            <button
              key={buffer.id}
              className={`editor-explorer__file${buffer.path.includes('/') ? ' editor-explorer__file--nested' : ''}`}
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
        })}
      </div>
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
