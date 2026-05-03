import { globalShortcut } from 'electron'
import log from './logger'
import { showSettings } from './windows/settings'
import type { OverlayManager } from './overlay/manager'
import type { HotkeyAction, HotkeyConfig } from '../shared/types'

let lastBindings: HotkeyConfig = {}

export function applyHotkeys(config: HotkeyConfig, overlay: OverlayManager): void {
  globalShortcut.unregisterAll()
  lastBindings = {}

  const handlers: Record<HotkeyAction, () => void> = {
    toggleVisibility: () => overlay.setVisible(!overlay.isVisible()),
    reloadAll: () => overlay.reloadAll(),
    openSettings: () => showSettings()
  }

  for (const action of Object.keys(handlers) as HotkeyAction[]) {
    const accel = config[action]
    if (!accel) continue
    try {
      const ok = globalShortcut.register(accel, handlers[action])
      if (!ok) {
        log.warn('Failed to register hotkey', { action, accelerator: accel })
      } else {
        lastBindings[action] = accel
      }
    } catch (err) {
      log.warn('Hotkey register threw', { action, accelerator: accel, err })
    }
  }
}

export function disposeHotkeys(): void {
  globalShortcut.unregisterAll()
  lastBindings = {}
}

export function getActiveHotkeys(): HotkeyConfig {
  return { ...lastBindings }
}
