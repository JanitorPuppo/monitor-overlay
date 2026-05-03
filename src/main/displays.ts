import { screen, Display } from 'electron'
import type { DisplayInfo } from '../shared/types'

export function listDisplays(): DisplayInfo[] {
  const primaryId = screen.getPrimaryDisplay().id
  return screen.getAllDisplays().map((d, idx) => toInfo(d, idx, primaryId))
}

export function findDisplay(displayId: number): Display | null {
  return screen.getAllDisplays().find((d) => d.id === displayId) ?? null
}

export function getPrimaryDisplay(): Display {
  return screen.getPrimaryDisplay()
}

function toInfo(d: Display, idx: number, primaryId: number): DisplayInfo {
  return {
    id: d.id,
    label: `${idx + 1}: ${d.label || 'Display'} (${d.size.width}\u00d7${d.size.height})`,
    bounds: { ...d.bounds },
    workArea: { ...d.workArea },
    isPrimary: d.id === primaryId,
    scaleFactor: d.scaleFactor
  }
}

export function onDisplaysChanged(handler: () => void): () => void {
  const onChange = (): void => handler()
  screen.on('display-added', onChange)
  screen.on('display-removed', onChange)
  screen.on('display-metrics-changed', onChange)
  return () => {
    screen.off('display-added', onChange)
    screen.off('display-removed', onChange)
    screen.off('display-metrics-changed', onChange)
  }
}
