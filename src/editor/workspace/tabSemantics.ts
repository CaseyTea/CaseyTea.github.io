import type { BufferId } from '../buffers/types'

export const activeBufferPanelId = 'active-buffer-panel'

export function getBufferTabId(id: BufferId): string {
  return `buffer-tab-${id}`
}
