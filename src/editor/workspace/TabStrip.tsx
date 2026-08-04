import type { KeyboardEvent } from 'react'
import type { BufferId, BufferRegistry } from '../buffers/types'

type TabStripProps = {
  registry: BufferRegistry
  activeId: BufferId
  openIds: BufferId[]
  onOpenBuffer: (id: BufferId) => void
  onCycleBuffer: (direction: 1 | -1) => void
}

export function TabStrip({
  registry,
  activeId,
  openIds,
  onOpenBuffer,
  onCycleBuffer,
}: TabStripProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

    event.preventDefault()
    onCycleBuffer(event.key === 'ArrowRight' ? 1 : -1)
  }

  return (
    <div
      className="editor-tab-strip"
      role="tablist"
      aria-label="Open files"
      onKeyDown={handleKeyDown}
    >
      {openIds.map((id) => {
        const buffer = registry.byId.get(id)
        if (!buffer) return null

        const isActive = id === activeId

        return (
          <button
            key={id}
            className="editor-tab"
            type="button"
            role="tab"
            aria-label={`Open ${buffer.path}`}
            aria-selected={isActive}
            aria-controls="active-buffer"
            tabIndex={isActive ? 0 : -1}
            onClick={() => onOpenBuffer(id)}
          >
            {buffer.filename}
          </button>
        )
      })}
    </div>
  )
}
