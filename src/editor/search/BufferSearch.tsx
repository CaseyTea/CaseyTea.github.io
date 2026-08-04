import { useEffect, useRef } from 'react'

type BufferSearchProps = {
  query: string
  matchCount: number
  currentMatch: number | null
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  onQueryChange: (query: string) => void
}

export function BufferSearch({
  query,
  matchCount,
  currentMatch,
  onClose,
  onNext,
  onPrevious,
  onQueryChange,
}: BufferSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const matchLabel = matchCount > 0 && currentMatch !== null
    ? `${currentMatch + 1} of ${matchCount} matches`
    : '0 matches'

  return (
    <div className="buffer-search" role="search" aria-label="Search current buffer">
      <label className="buffer-search__field">
        <span className="buffer-search__label">Search current buffer</span>
        <span className="buffer-search__prefix" aria-hidden="true">/</span>
        <input
          ref={inputRef}
          type="search"
          autoComplete="off"
          spellCheck="false"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              onClose()
              return
            }

            if (event.key === 'Enter') {
              event.preventDefault()
              if (event.shiftKey) onPrevious()
              else onNext()
            }
          }}
        />
      </label>
      <output className="buffer-search__count" aria-live="polite">
        {matchLabel}
      </output>
    </div>
  )
}
