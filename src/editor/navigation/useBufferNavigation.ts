import { useCallback, useEffect, useState } from 'react'
import type { BufferDefinition, BufferId, BufferRegistry } from '../buffers/types'

type ParsedBufferHash = {
  id: BufferId | null
  value: string
}

export function parseBufferHash(hash: string, registry: BufferRegistry): ParsedBufferHash {
  const rawHash = hash.startsWith('#') ? hash.slice(1) : hash
  const value = rawHash.startsWith('buffer=') ? rawHash.slice('buffer='.length) : rawHash
  let decodedValue: string

  try {
    decodedValue = decodeURIComponent(value)
  } catch {
    return { id: null, value }
  }

  return { id: registry.resolve(decodedValue), value: decodedValue }
}

function addOpenId(openIds: BufferId[], id: BufferId): BufferId[] {
  return openIds.includes(id) ? openIds : [...openIds, id]
}

function pushBufferHash(filename: string): void {
  const nextHash = `#buffer=${filename}`
  if (window.location.hash === nextHash) return

  window.history.pushState(
    null,
    '',
    window.location.pathname + window.location.search + nextHash,
  )
}

export function useBufferNavigation(registry: BufferRegistry) {
  const initialHash = parseBufferHash(window.location.hash, registry)
  const hasInitialHash = window.location.hash.length > 1
  const initialId = initialHash.id ?? registry.defaultId
  const [activeId, setActiveId] = useState<BufferId>(initialId)
  const [openIds, setOpenIds] = useState<BufferId[]>(() =>
    addOpenId(['readme', 'experience'], initialId),
  )
  const [openEpoch, setOpenEpoch] = useState(0)
  const [statusMessage, setStatusMessage] = useState<string | null>(() =>
    hasInitialHash && !initialHash.id ? `file not found: ${initialHash.value}` : null,
  )

  useEffect(() => {
    if (hasInitialHash && !initialHash.id) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [hasInitialHash, initialHash.id])

  const activate = useCallback((id: BufferId) => {
    const buffer = registry.byId.get(id)

    setActiveId(id)
    setOpenIds((currentOpenIds) => addOpenId(currentOpenIds, id))
    setOpenEpoch((currentEpoch) => currentEpoch + 1)
    setStatusMessage(buffer ? `opened ${buffer.path}` : null)
  }, [registry])

  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseBufferHash(window.location.hash, registry)

      if (window.location.hash.length <= 1) {
        activate(registry.defaultId)
        return
      }

      if (parsed.id) {
        activate(parsed.id)
        return
      }

      activate(registry.defaultId)
      setStatusMessage(`file not found: ${parsed.value}`)
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [activate, registry])

  const openBuffer = useCallback(
    (id: BufferId) => {
      const buffer = registry.byId.get(id)
      if (!buffer) return

      activate(id)
      pushBufferHash(buffer.filename)
    },
    [activate, registry],
  )

  const cycleBuffer = useCallback(
    (direction: 1 | -1) => {
      const currentIndex = openIds.indexOf(activeId)
      if (currentIndex < 0 || openIds.length === 0) return

      const nextIndex = (currentIndex + direction + openIds.length) % openIds.length
      const nextId = openIds[nextIndex]
      const buffer = registry.byId.get(nextId)

      activate(nextId)
      if (buffer) pushBufferHash(buffer.filename)
    },
    [activate, activeId, openIds, registry],
  )

  return {
    activeId,
    activeBuffer: registry.byId.get(activeId) as BufferDefinition,
    openIds,
    openEpoch,
    statusMessage,
    openBuffer,
    cycleBuffer,
    clearStatus: () => setStatusMessage(null),
  }
}
