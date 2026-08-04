import type { ReactNode } from 'react'
import type { BufferId, BufferRegistry } from '../buffers/types'
import { EditorStatus } from './EditorStatus'
import { EditorTopBar } from './EditorTopBar'
import { Explorer } from './Explorer'
import { useMobileExplorer } from './useMobileExplorer'

export type EditorWorkspaceProps = {
  registry: BufferRegistry
  activeId: BufferId
  openIds: BufferId[]
  onOpenBuffer: (id: BufferId) => void
  onCycleBuffer: (direction: 1 | -1) => void
  vimEnabled: boolean
  onToggleVim: () => void
  statusMessage: string | null
  children: ReactNode
}

export function EditorWorkspace({
  registry,
  activeId,
  openIds,
  onOpenBuffer,
  onCycleBuffer,
  vimEnabled,
  onToggleVim,
  statusMessage,
  children,
}: EditorWorkspaceProps) {
  const activeBuffer = registry.byId.get(activeId) ?? registry.byId.get(registry.defaultId)
  const mobileExplorer = useMobileExplorer()

  if (!activeBuffer) return null

  const openFromExplorer = (id: BufferId) => {
    mobileExplorer.closeAfterSelection()
    onOpenBuffer(id)
  }

  return (
    <div className="editor-workspace">
      <a className="editor-skip-link" href="#active-buffer">
        Skip to content
      </a>
      <EditorTopBar
        registry={registry}
        activeId={activeId}
        openIds={openIds}
        onOpenBuffer={onOpenBuffer}
        onCycleBuffer={onCycleBuffer}
        filesButtonRef={mobileExplorer.openerRef}
        isExplorerOpen={mobileExplorer.isOpen}
        onOpenExplorer={mobileExplorer.openExplorer}
      />
      <div className="editor-workspace__body">
        {mobileExplorer.isMobile && mobileExplorer.isOpen ? (
          <button
            className="editor-explorer-overlay"
            type="button"
            aria-label="Close files"
            onClick={mobileExplorer.dismissExplorer}
          />
        ) : null}
        <Explorer
          registry={registry}
          activeId={activeId}
          vimEnabled={vimEnabled}
          onOpenBuffer={openFromExplorer}
          onToggleVim={onToggleVim}
          className={mobileExplorer.isOpen ? 'editor-explorer--open' : ''}
          hiddenFromAccessibility={mobileExplorer.isMobile && !mobileExplorer.isOpen}
        />
        <main id="active-buffer" className="editor-buffer-frame" aria-label={activeBuffer.path}>
          {children}
        </main>
      </div>
      <EditorStatus
        activeBuffer={activeBuffer}
        vimEnabled={vimEnabled}
        statusMessage={statusMessage}
      />
    </div>
  )
}
