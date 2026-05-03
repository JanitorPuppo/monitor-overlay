import { app, BrowserWindow } from 'electron'
import { electronApp } from '@electron-toolkit/utils'
import log from './logger'
import { APP_ID } from '../shared/constants'
import { loadConfig, isFirstRun } from './config'
import { OverlayManager } from './overlay/manager'
import { createTray, destroyTray } from './tray'
import { showSettings } from './windows/settings'
import { applyHotkeys, disposeHotkeys } from './hotkeys'
import { applyAutostart } from './autostart'
import { onDisplaysChanged } from './displays'
import { registerIpc, broadcastState } from './ipc'
import { registerRegionPickerHandlers } from './region-picker'
import { setupAutoUpdater } from './updater'

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    showSettings()
  })

  app.on('window-all-closed', () => {
    /* keep app alive in tray */
  })

  app.on('before-quit', () => {
    disposeHotkeys()
    destroyTray()
  })

  app.whenReady().then(bootstrap).catch((err) => {
    log.error('Bootstrap failed', err)
    app.quit()
  })
}

async function bootstrap(): Promise<void> {
  electronApp.setAppUserModelId(APP_ID)
  app.setAppUserModelId(APP_ID)

  const config = await loadConfig()
  log.info('App starting', { firstRun: isFirstRun(config) })

  const overlay = new OverlayManager(config.overlays[0], config.overlayVisible)
  overlay.start()

  const ctx = { overlay }
  registerRegionPickerHandlers()
  registerIpc(ctx)
  createTray(overlay)

  applyAutostart(config.autostart)
  applyHotkeys(config.hotkeys, overlay)

  const offDisplay = onDisplaysChanged(() => {
    overlay.onDisplaysChanged()
    broadcastState(ctx)
  })
  app.on('before-quit', () => offDisplay())

  const firstRun = isFirstRun(config)
  if (firstRun || config.settingsOpenOnLaunch) {
    showSettings()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) showSettings()
  })

  setupAutoUpdater()
}
