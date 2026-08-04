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

export function useBufferNavigation(registry: BufferRegistry) {
  const initialHash = parseBufferHash(window.location.hash, registry)
  const hasInitialHash = window.location.hash.length > 1
  const initialId = initialHash.id ?? registry.defaultId
  const [activeId, setActiveId] = useState<BufferId>(initialId)
  const [openIds, setOpenIds] = useState<BufferId[]>(() =>
    addOpenId(['readme', 'experience'], initialId),
  )
  const [statusMessage, setStatusMessage] = useState<string | null>(() =>
    hasInitialHash && !initialHash.id ? `file not found: ${initialHash.value}` : null,
  )

  useEffect(() => {
    if (hasInitialHash && !initialHash.id) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [hasInitialHash, initialHash.id])

  const activate = useCallback((id: BufferId) => {
    setActiveId(id)
    setOpenIds((currentOpenIds) => addOpenId(currentOpenIds, id))
    setStatusMessage(null)
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseBufferHash(window.location.hash, registry)

      if (parsed.id) {
        activate(parsed.id)
        return
      }

      setActiveId(registry.defaultId)
      setOpenIds((currentOpenIds) => addOpenId(currentOpenIds, registry.defaultId))
      setStatusMessage(`file not found: ${parsed.value}`)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [activate, registry])

  const openBuffer = useCallback(
    (id: BufferId) => {
      const buffer = registry.byId.get(id)
      if (!buffer) return

      activate(id)
      window.location.hash = `buffer=${buffer.filename}`
    },
    [activate, registry],
  )

  const cycleBuffer = useCallback(
    (direction: 1 | -1) => {
      setOpenIds((currentOpenIds) => {
        const currentIndex = currentOpenIds.indexOf(activeId)
        const nextIndex = (currentIndex + direction + currentOpenIds.length) % currentOpenIds.length
        const nextId = currentOpenIds[nextIndex]
        setActiveId(nextId)
        setStatusMessage(null)

        const buffer = registry.byId.get(nextId)
        if (buffer) window.location.hash = `buffer=${buffer.filename}`

        return currentOpenIds
      })
    },
    [activeId, registry],
  )

  return {
    activeId,
    activeBuffer: registry.byId.get(activeId) as BufferDefinition,
    openIds,
    statusMessage,
    openBuffer,
    cycleBuffer,
    clearStatus: () => setStatusMessage(null),
  }
}
