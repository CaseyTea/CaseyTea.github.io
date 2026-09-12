import { useEffect, useState } from 'react'
import { useVimShortcutsPreference } from '../components/keyboard/useVimShortcutsPreference'
import { portfolioData } from '../data/portfolio'
import type { Command } from '../data/types'
import { createBufferRegistry } from '../editor/buffers/createBufferRegistry'
import type { BufferId } from '../editor/buffers/types'
import { EditorCommandMode } from '../editor/command/EditorCommandMode'
import { createDocumentLines } from '../editor/document/createDocumentLines'
import { DocumentBuffer } from '../editor/document/DocumentBuffer'
import type { DocumentActions } from '../editor/document/types'
import { useActiveLineController } from '../editor/keyboard/useActiveLineController'
import { useVimInterpreter, type VimEasterEgg } from '../editor/keyboard/useVimInterpreter'
import { useBufferNavigation } from '../editor/navigation/useBufferNavigation'
import { BufferSearch } from '../editor/search/BufferSearch'
import { useBufferSearch } from '../editor/search/useBufferSearch'
import { EditorWorkspace } from '../editor/workspace/EditorWorkspace'

const registry = createBufferRegistry(portfolioData)
const firstProjectId = Array.from(registry.byId.keys()).find((id) => id.startsWith('project-')) ?? 'readme'

const commandBufferIds: Record<string, BufferId> = {
  overview: 'readme',
  experience: 'experience',
  projects: firstProjectId,
  skills: 'about',
  about: 'about',
  contact: 'contact',
}

function downloadResume() {
  document
    .querySelector<HTMLAnchorElement>(`a[download][href="${portfolioData.resumeUrl}"]`)
    ?.click()
}

function openLink(href: string) {
  window.open(href, '_blank', 'noopener,noreferrer')
}

export function App() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [editorStatusMessage, setEditorStatusMessage] = useState<string | null>(null)
  const { enabled: vimShortcutsEnabled, toggle: toggleVimShortcuts } =
    useVimShortcutsPreference()
  const navigation = useBufferNavigation(registry)

  const documentActions: DocumentActions = {
    openBuffer: navigation.openBuffer,
    openLink,
    downloadResume,
  }
  const lines = createDocumentLines(navigation.activeBuffer, portfolioData, documentActions)
  const activeLine = useActiveLineController({
    bufferId: navigation.activeId,
    lines,
    resetKey: navigation.openEpoch,
  })
  const search = useBufferSearch({
    bufferId: navigation.activeId,
    resetKey: navigation.openEpoch,
    lines,
    activeIndex: activeLine.activeIndex,
    setActiveIndex: activeLine.setActiveIndex,
    onStatusMessage: setEditorStatusMessage,
  })

  const reportEasterEgg = (command: VimEasterEgg) => {
    setEditorStatusMessage(
      command === 'i' ? 'portfolio is read-only' : 'portfolio already saved',
    )
  }

  useEffect(() => {
    setEditorStatusMessage(null)
  }, [navigation.openEpoch])

  const setVimShortcuts = (enabled: boolean) => {
    if (enabled !== vimShortcutsEnabled) toggleVimShortcuts()
  }

  useVimInterpreter({
    vimEnabled: vimShortcutsEnabled,
    isCommandOpen: isCommandPaletteOpen,
    isSearchOpen: search.isOpen,
    moveLines: activeLine.moveLines,
    moveHalfPage: activeLine.moveHalfPage,
    moveBoundary: activeLine.moveBoundary,
    activateLine: activeLine.activateLine,
    cycleBuffer: navigation.cycleBuffer,
    openPrimaryBuffer: (position) => {
      const id = registry.primaryIds[position - 1]
      if (id) navigation.openBuffer(id)
    },
    onEasterEgg: reportEasterEgg,
    onOpenSearch: search.open,
  })

  const commands: Command[] = [
    ...portfolioData.commandSections.map(({ id, keywords, label }) => ({
      id: `section-${id}`,
      label,
      keywords,
      run: () => navigation.openBuffer(commandBufferIds[id] ?? registry.defaultId),
      restoreInvokingFocus: false,
    })),
    {
      id: 'resume',
      label: 'Download resume',
      keywords: ['resume', 'cv', 'pdf'],
      run: downloadResume,
    },
    ...portfolioData.contacts.map(({ href, label }) => ({
      id: `contact-${label.toLowerCase()}`,
      label: `Open ${label}`,
      keywords: ['contact', label.toLowerCase()],
      run: () => openLink(href),
    })),
    {
      id: 'toggle-vim-shortcuts',
      label: `${vimShortcutsEnabled ? 'Disable' : 'Enable'} Vim scroll shortcuts`,
      keywords: ['vim', 'scroll', 'shortcut', 'keyboard', 'toggle'],
      run: toggleVimShortcuts,
    },
    {
      id: 'shortcut-help',
      label: 'Show keyboard shortcuts',
      keywords: ['shortcut', 'help', 'keyboard', 'commands'],
      run: () => {
        window.alert(
          `Open commands with : or Command/Ctrl+K. Vim scroll shortcuts are ${vimShortcutsEnabled ? 'enabled and can be disabled' : 'disabled and can be enabled'} from this command palette. Scroll with j/k, Ctrl+d/Ctrl+u, gg (top), and G (bottom). Use the arrow keys to choose, Enter to run, and Escape to close.`,
        )
      },
    },
  ]

  return (
    <>
      <EditorWorkspace
        portfolioData={portfolioData}
        registry={registry}
        activeId={navigation.activeId}
        openIds={navigation.openIds}
        onOpenBuffer={navigation.openBuffer}
        onCycleBuffer={navigation.cycleBuffer}
        vimEnabled={vimShortcutsEnabled}
        onToggleVim={toggleVimShortcuts}
        statusMessage={editorStatusMessage ?? navigation.statusMessage}
        activeLineIndex={activeLine.activeIndex}
        lineCount={lines.length}
        isCommandOpen={isCommandPaletteOpen}
        statusSearch={search.isOpen ? (
          <BufferSearch
            query={search.query}
            matchCount={search.matchIndexes.length}
            currentMatch={search.currentMatch}
            onClose={search.close}
            onNext={search.next}
            onPrevious={search.previous}
            onQueryChange={search.setQuery}
          />
        ) : null}
      >
        <DocumentBuffer
          buffer={navigation.activeBuffer}
          lines={lines}
          activeIndex={activeLine.activeIndex}
          matchIndexes={search.matchIndexes}
          navigationEpoch={navigation.openEpoch}
        />
      </EditorWorkspace>
      <EditorCommandMode
        commands={commands}
        registry={registry}
        isSearchOpen={search.isOpen}
        onOpenBuffer={navigation.openBuffer}
        onResume={downloadResume}
        onSetVim={setVimShortcuts}
        onStatusMessage={setEditorStatusMessage}
        onOpenChange={setIsCommandPaletteOpen}
      />
    </>
  )
}
