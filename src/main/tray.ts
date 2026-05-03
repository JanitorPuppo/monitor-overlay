import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'
import log from './logger'
import { showSettings } from './windows/settings'
import type { OverlayManager } from './overlay/manager'

let tray: Tray | null = null

export function createTray(overlay: OverlayManager): Tray {
  const iconPath = join(__dirname, '../../resources/icon.png')
  let image = nativeImage.createFromPath(iconPath)
  if (image.isEmpty()) {
    image = nativeImage.createEmpty()
  } else {
    image = image.resize({ width: 16, height: 16 })
  }

  tray = new Tray(image)
  tray.setToolTip('Monitor Overlay')
  tray.on('click', () => showSettings())
  tray.on('double-click', () => showSettings())

  refreshMenu(overlay)

  overlay.on('changed', () => refreshMenu(overlay))

  return tray
}

export function refreshMenu(overlay: OverlayManager): void {
  if (!tray) return
  const visible = overlay.isVisible()
  const present = overlay.isDisplayPresent()

  const menu = Menu.buildFromTemplate([
    {
      label: visible ? 'Hide overlay' : 'Show overlay',
      enabled: present,
      click: () => overlay.setVisible(!visible)
    },
    {
      label: 'Reload all sources',
      click: () => overlay.reloadAll()
    },
    { type: 'separator' },
    {
      label: 'Open Settings',
      click: () => showSettings()
    },
    { type: 'separator' },
    {
      label: present ? 'Display: connected' : 'Display: disconnected',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        log.info('Quit from tray')
        app.quit()
      }
    }
  ])
  tray.setContextMenu(menu)
  tray.setToolTip(present ? 'Monitor Overlay' : 'Monitor Overlay — display disconnected')
}

export function destroyTray(): void {
  if (tray && !tray.isDestroyed()) tray.destroy()
  tray = null
}
