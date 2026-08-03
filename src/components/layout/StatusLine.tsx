type StatusLineProps = {
  activeSection: string
}

export function StatusLine({ activeSection }: StatusLineProps) {
  return (
    <footer className="status-line">
      <span className="status-line__state">
        <span className="status-line__dot" aria-hidden="true" />
        Portfolio online
      </span>
      <span aria-label={`Current section: ${activeSection}`}>Viewing / {activeSection}</span>
      <span>Commands: : or Command/Ctrl+K (optional)</span>
    </footer>
  )
}
