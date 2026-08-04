import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type ReactElement,
  type Ref,
} from 'react'
import type { BufferDefinition } from '../buffers/types'
import { getDocumentHeadingId } from './documentIds'
import type { DocumentLine } from './types'
import '../../styles/editor-document.css'

type HeadingProps = {
  id?: string
  tabIndex?: number
  ref?: Ref<HTMLHeadingElement>
}

type DocumentBufferProps = {
  buffer: BufferDefinition
  lines: DocumentLine[]
  activeIndex?: number
  matchIndexes?: number[]
}

function renderHeading(
  content: DocumentLine['content'],
  headingId: string,
  headingRef: Ref<HTMLHeadingElement>,
) {
  if (!isValidElement(content) || content.type !== 'h1') return content

  return cloneElement(content as ReactElement<HeadingProps>, {
    id: headingId,
    tabIndex: -1,
    ref: headingRef,
  })
}

export function DocumentBuffer({
  buffer,
  lines,
  activeIndex = 0,
  matchIndexes = [],
}: DocumentBufferProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingId = getDocumentHeadingId(buffer.id)
  const matches = new Set(matchIndexes)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [buffer.id])

  return (
    <article
      className="document-buffer"
      aria-labelledby={headingId}
      data-buffer-id={buffer.id}
      data-buffer-kind={buffer.kind}
    >
      {lines.map((line, index) => {
        const isActive = index === activeIndex
        const isMatch = matches.has(index)
        const className = [
          'document-line',
          isActive ? 'document-line--active' : '',
          isMatch ? 'document-line--search-match' : '',
          line.action ? 'document-line--action' : '',
        ].filter(Boolean).join(' ')

        return (
          <div
            key={line.id}
            id={line.id}
            className={className}
            data-editor-line=""
            data-editor-line-id={line.id}
            data-editor-action={line.action?.label}
            aria-current={isActive ? 'true' : undefined}
          >
            <span className="document-line__number" aria-hidden="true">
              {line.number}
            </span>
            <div className="document-line__content">
              {index === 0
                ? renderHeading(line.content, headingId, headingRef)
                : line.content}
              {line.action ? (
                <span className="document-line__action-label">
                  Action: {line.action.label}
                </span>
              ) : null}
            </div>
          </div>
        )
      })}
    </article>
  )
}
