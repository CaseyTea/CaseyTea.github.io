import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react'
import type { BufferId } from '../buffers/types'
import type { DocumentLine } from '../document/types'

type ActiveLineControllerOptions = {
  bufferId: BufferId
  lines: DocumentLine[]
}

type CursorState = {
  bufferId: BufferId
  index: number
}

function clampIndex(index: number, lineCount: number): number {
  if (lineCount === 0) return 0
  return Math.min(Math.max(index, 0), lineCount - 1)
}

function lineSelector(id: string): string {
  const escapedId = id.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
  return `[data-editor-line-id="${escapedId}"]`
}

function getRegisteredRow(lineId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(lineSelector(lineId))
}

function getVisibleLineCount(lines: DocumentLine[]): number {
  return lines.reduce((visibleCount, line) => {
    const bounds = getRegisteredRow(line.id)?.getBoundingClientRect()
    return bounds && bounds.bottom > 0 && bounds.top < window.innerHeight
      ? visibleCount + 1
      : visibleCount
  }, 0)
}

function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

export function useActiveLineController({
  bufferId,
  lines,
}: ActiveLineControllerOptions) {
  const linesRef = useRef(lines)
  linesRef.current = lines
  const [cursor, setCursor] = useState<CursorState>({ bufferId, index: 0 })
  const activeIndex = cursor.bufferId === bufferId
    ? clampIndex(cursor.index, lines.length)
    : 0
  const activeLineId = lines[activeIndex]?.id

  const setActiveIndex = useCallback(
    (nextIndex: SetStateAction<number>) => {
      setCursor((currentCursor) => {
        const currentIndex = currentCursor.bufferId === bufferId
          ? clampIndex(currentCursor.index, linesRef.current.length)
          : 0
        const requestedIndex = typeof nextIndex === 'function'
          ? nextIndex(currentIndex)
          : nextIndex

        return {
          bufferId,
          index: clampIndex(requestedIndex, linesRef.current.length),
        }
      })
    },
    [bufferId],
  )

  const moveLines = useCallback(
    (delta: number) => setActiveIndex((currentIndex) => currentIndex + delta),
    [setActiveIndex],
  )

  const moveHalfPage = useCallback(
    (direction: 1 | -1) => {
      const visibleLineCount = getVisibleLineCount(linesRef.current)
      const distance = Math.max(1, Math.floor(visibleLineCount / 2))
      moveLines(direction * distance)
    },
    [moveLines],
  )

  const moveBoundary = useCallback(
    (edge: 'first' | 'last') => {
      setActiveIndex(edge === 'first' ? 0 : linesRef.current.length - 1)
    },
    [setActiveIndex],
  )

  const activateLine = useCallback(() => {
    linesRef.current[activeIndex]?.action?.run()
  }, [activeIndex])

  const resetForBuffer = useCallback(() => setActiveIndex(0), [setActiveIndex])

  useEffect(() => {
    setCursor((currentCursor) =>
      currentCursor.bufferId === bufferId
        ? currentCursor
        : { bufferId, index: 0 },
    )
  }, [bufferId])

  useEffect(() => {
    if (!activeLineId) return

    getRegisteredRow(activeLineId)?.scrollIntoView?.({
      block: 'nearest',
      behavior: getScrollBehavior(),
    })
  }, [activeLineId, bufferId])

  return {
    activeIndex,
    setActiveIndex,
    moveLines,
    moveHalfPage,
    moveBoundary,
    activateLine,
    resetForBuffer,
  }
}
