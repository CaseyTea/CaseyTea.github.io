import type { RefObject } from 'react'
import { portfolioData } from '../../data/portfolio'
import type { BufferId, BufferRegistry } from '../buffers/types'
import { TabStrip } from './TabStrip'

type EditorTopBarProps = {
  registry: BufferRegistry
  activeId: BufferId
  openIds: BufferId[]
  onOpenBuffer: (id: BufferId) => void
  onCycleBuffer: (direction: 1 | -1) => void
  filesButtonRef?: RefObject<HTMLButtonElement | null>
  isExplorerOpen?: boolean
  onOpenExplorer?: () => void
}

export function EditorTopBar({
  registry,
  activeId,
  openIds,
  onOpenBuffer,
  onCycleBuffer,
  filesButtonRef,
  isExplorerOpen = false,
  onOpenExplorer,
}: EditorTopBarProps) {
  return (
    <header className="editor-top-bar">
      <div className="editor-identity">
        <span className="editor-identity__name">Casey Franceschy</span>
        <span className="editor-identity__role">Software Developer</span>
      </div>
      <button
        ref={filesButtonRef}
        className="editor-files-button"
        type="button"
        aria-controls="portfolio-explorer"
        aria-expanded={isExplorerOpen}
        onClick={onOpenExplorer}
      >
        Files
      </button>
      <TabStrip
        registry={registry}
        activeId={activeId}
        openIds={openIds}
        onOpenBuffer={onOpenBuffer}
        onCycleBuffer={onCycleBuffer}
      />
      <div className="editor-top-bar__actions">
        <a className="editor-resume-link" href={portfolioData.resumeUrl} download>
          Download resume
        </a>
        <button
          className="editor-help-button"
          type="button"
          aria-label="Keyboard shortcuts"
          onClick={() => onOpenBuffer('help')}
        >
          ?
        </button>
      </div>
    </header>
  )
}
