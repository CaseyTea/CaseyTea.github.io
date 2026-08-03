type StatusLineProps = {
  activeSection: string
  vimShortcutsEnabled: boolean
}

export function StatusLine({ activeSection, vimShortcutsEnabled }: StatusLineProps) {
  return (
    <footer className="status-line">
      <span className="status-line__state">
        <span className="status-line__dot" aria-hidden="true" />
        Portfolio online
      </span>
      <span aria-label={`Current section: ${activeSection}`}>Viewing / {activeSection}</span>
      <span aria-live="polite">Vim scroll keys: {vimShortcutsEnabled ? 'On' : 'Off'}</span>
      <span>Commands: : or Command/Ctrl+K (optional)</span>
    </footer>
  )
}
