import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BufferId } from '../buffers/types'
import type { DocumentLine } from '../document/types'

type BufferSearchOptions = {
  bufferId: BufferId
  lines: DocumentLine[]
  activeIndex: number
  setActiveIndex: (index: number) => void
  onStatusMessage?: (message: string | null) => void
}

function normalizeQuery(query: string): string {
  return query.trim().toLocaleLowerCase()
}

function findMatchIndexes(lines: DocumentLine[], query: string): number[] {
  const normalizedQuery = normalizeQuery(query)

  if (!normalizedQuery) return []

  return lines.reduce<number[]>((indexes, line, index) => {
    if (line.searchText.toLocaleLowerCase().includes(normalizedQuery)) indexes.push(index)
    return indexes
  }, [])
}

export function useBufferSearch({
  bufferId,
  lines,
  activeIndex,
  setActiveIndex,
  onStatusMessage,
}: BufferSearchOptions) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, updateQuery] = useState('')
  const [currentMatch, setCurrentMatch] = useState<number | null>(null)
  const previousBufferId = useRef(bufferId)
  const invokingActiveIndex = useRef<number | null>(null)
  const invokingFocusedElement = useRef<HTMLElement | null>(null)
  const linesRef = useRef(lines)
  const queryRef = useRef(query)
  const currentMatchRef = useRef(currentMatch)
  linesRef.current = lines
  queryRef.current = query
  currentMatchRef.current = currentMatch

  const matchIndexes = useMemo(() => findMatchIndexes(lines, query), [lines, query])

  const open = useCallback(() => {
    invokingActiveIndex.current = activeIndex
    invokingFocusedElement.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    updateQuery('')
    queryRef.current = ''
    setCurrentMatch(null)
    currentMatchRef.current = null
    onStatusMessage?.(null)
    setIsOpen(true)
  }, [activeIndex, onStatusMessage])

  const close = useCallback(() => {
    setIsOpen(false)
    updateQuery('')
    queryRef.current = ''
    setCurrentMatch(null)
    currentMatchRef.current = null

    if (invokingActiveIndex.current !== null) {
      setActiveIndex(invokingActiveIndex.current)
    }
    invokingFocusedElement.current?.focus({ preventScroll: true })
    invokingActiveIndex.current = null
    invokingFocusedElement.current = null
  }, [setActiveIndex])

  const setQuery = useCallback((nextQuery: string) => {
    const nextMatchIndexes = findMatchIndexes(linesRef.current, nextQuery)
    const normalizedQuery = normalizeQuery(nextQuery)

    updateQuery(nextQuery)
    queryRef.current = nextQuery
    setCurrentMatch(nextMatchIndexes.length > 0 ? 0 : null)
    currentMatchRef.current = nextMatchIndexes.length > 0 ? 0 : null

    if (nextMatchIndexes.length > 0) {
      setActiveIndex(nextMatchIndexes[0])
      onStatusMessage?.(null)
    } else if (normalizedQuery) {
      onStatusMessage?.(`pattern not found: ${nextQuery}`)
    } else {
      onStatusMessage?.(null)
    }
  }, [onStatusMessage, setActiveIndex])

  const moveMatch = useCallback((direction: 1 | -1) => {
    const matches = findMatchIndexes(linesRef.current, queryRef.current)

    if (matches.length === 0) {
      const normalizedQuery = normalizeQuery(queryRef.current)
      if (normalizedQuery) onStatusMessage?.(`pattern not found: ${queryRef.current}`)
      return
    }

    const current = currentMatchRef.current
    const nextMatch = current === null
      ? direction === 1 ? 0 : matches.length - 1
      : (current + direction + matches.length) % matches.length

    setCurrentMatch(nextMatch)
    currentMatchRef.current = nextMatch
    setActiveIndex(matches[nextMatch])
    onStatusMessage?.(null)
  }, [onStatusMessage, setActiveIndex])

  const next = useCallback(() => moveMatch(1), [moveMatch])
  const previous = useCallback(() => moveMatch(-1), [moveMatch])

  useEffect(() => {
    if (previousBufferId.current === bufferId) return

    previousBufferId.current = bufferId
    invokingActiveIndex.current = null
    invokingFocusedElement.current = null
    updateQuery('')
    queryRef.current = ''
    setCurrentMatch(null)
    currentMatchRef.current = null
    setIsOpen(false)
    onStatusMessage?.(null)
  }, [bufferId, onStatusMessage])

  return {
    isOpen,
    query,
    matchIndexes,
    currentMatch,
    open,
    close,
    setQuery,
    next,
    previous,
  }
}
