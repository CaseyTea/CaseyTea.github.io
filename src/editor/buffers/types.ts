export type BufferId =
  | 'readme'
  | 'experience'
  | `project-${string}`
  | 'about'
  | 'contact'
  | 'help'

export type BufferKind = 'markdown' | 'log' | 'help'

export type BufferDefinition = {
  id: BufferId
  filename: string
  path: string
  kind: BufferKind
  aliases: string[]
  title: string
  searchText: string
  projectId?: string
}

export type BufferRegistry = {
  defaultId: BufferId
  primaryIds: BufferId[]
  byId: Map<BufferId, BufferDefinition>
  resolve: (candidate: string) => BufferId | null
}
