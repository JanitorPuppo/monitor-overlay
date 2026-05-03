import { app } from 'electron'
import log from './logger'

export function applyAutostart(enabled: boolean): void {
  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true
    })
  } catch (err) {
    log.warn('Failed to set login item', err)
  }
}

export function isAutostartEnabled(): boolean {
  try {
    return app.getLoginItemSettings().openAtLogin
  } catch {
    return false
  }
}
