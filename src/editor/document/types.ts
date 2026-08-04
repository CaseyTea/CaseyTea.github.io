import type { ReactNode } from 'react'
import type { BufferId } from '../buffers/types'

export type DocumentAction = {
  label: string
  run: () => void
}

export type DocumentActions = {
  openBuffer: (id: BufferId) => void
  openLink: (href: string) => void
  downloadResume: () => void
}

export type DocumentLine = {
  id: string
  number: number
  searchText: string
  content: ReactNode
  action?: DocumentAction
}
