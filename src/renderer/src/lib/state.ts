import { useEffect, useSyncExternalStore } from 'react'
import type { AppState } from '../../../shared/types'

let currentState: AppState | null = null
const listeners = new Set<() => void>()

function notify(): void {
  for (const l of listeners) l()
}

function subscribe(l: () => void): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}

function getSnapshot(): AppState | null {
  return currentState
}

export function useAppState(): AppState | null {
  useEffect(() => {
    let off: (() => void) | null = null
    void window.api.getState().then((state) => {
      currentState = state
      notify()
    })
    off = window.api.onStateUpdate((state) => {
      currentState = state
      notify()
    })
    return () => {
      if (off) off()
    }
  }, [])
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
