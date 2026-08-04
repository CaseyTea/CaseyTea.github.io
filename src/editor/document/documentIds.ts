import type { BufferId } from '../buffers/types'

export function getDocumentHeadingId(bufferId: BufferId): string {
  return `buffer-${bufferId}-heading`
}
