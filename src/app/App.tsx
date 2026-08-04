import { useState } from 'react'
import { CommandPalette } from '../components/command/CommandPalette'
import { useVimScrollMotions } from '../components/keyboard/useVimScrollMotions'
import { useVimShortcutsPreference } from '../components/keyboard/useVimShortcutsPreference'
import { portfolioData } from '../data/portfolio'
import type { Command } from '../data/types'
import { createBufferRegistry } from '../editor/buffers/createBufferRegistry'
import type { BufferId } from '../editor/buffers/types'
import { createDocumentLines } from '../editor/document/createDocumentLines'
import { DocumentBuffer } from '../editor/document/DocumentBuffer'
import type { DocumentActions } from '../editor/document/types'
import { useBufferNavigation } from '../editor/navigation/useBufferNavigation'
import { EditorWorkspace } from '../editor/workspace/EditorWorkspace'

const registry = createBufferRegistry(portfolioData)
const firstProjectId = registry.primaryIds.find((id) => id.startsWith('project-')) ?? 'readme'

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
  const { enabled: vimShortcutsEnabled, toggle: toggleVimShortcuts } =
    useVimShortcutsPreference()
  const navigation = useBufferNavigation(registry)
  useVimScrollMotions({ disabled: isCommandPaletteOpen || !vimShortcutsEnabled })

  const documentActions: DocumentActions = {
    openBuffer: navigation.openBuffer,
    openLink,
    downloadResume,
  }
  const lines = createDocumentLines(navigation.activeBuffer, portfolioData, documentActions)

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
      id: `contact-${label.toLocaleLowerCase()}`,
      label: `Open ${label}`,
      keywords: ['contact', label.toLocaleLowerCase()],
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
        registry={registry}
        activeId={navigation.activeId}
        openIds={navigation.openIds}
        onOpenBuffer={navigation.openBuffer}
        onCycleBuffer={navigation.cycleBuffer}
        vimEnabled={vimShortcutsEnabled}
        onToggleVim={toggleVimShortcuts}
        statusMessage={navigation.statusMessage}
      >
        <DocumentBuffer buffer={navigation.activeBuffer} lines={lines} />
      </EditorWorkspace>
      <CommandPalette commands={commands} onOpenChange={setIsCommandPaletteOpen} />
    </>
  )
}
