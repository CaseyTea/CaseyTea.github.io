import { useRef, type KeyboardEvent } from 'react'
import type { BufferId, BufferRegistry } from '../buffers/types'
import { activeBufferPanelId, getBufferTabId } from './tabSemantics'

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
  const tabRefs = useRef(new Map<BufferId, HTMLButtonElement>())

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

    event.preventDefault()
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const navigableIds = openIds.filter((id) => registry.byId.has(id))
    const currentIndex = navigableIds.indexOf(activeId)

    if (currentIndex < 0 || navigableIds.length === 0) return

    const nextIndex = (currentIndex + direction + navigableIds.length) % navigableIds.length
    tabRefs.current.get(navigableIds[nextIndex])?.focus()
    onCycleBuffer(direction)
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
            ref={(node) => {
              if (node) tabRefs.current.set(id, node)
              else tabRefs.current.delete(id)
            }}
            id={getBufferTabId(id)}
            className="editor-tab"
            type="button"
            role="tab"
            aria-label={`Open ${buffer.path}`}
            aria-selected={isActive}
            aria-controls={activeBufferPanelId}
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
