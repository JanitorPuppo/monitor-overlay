import { Tray, Menu, nativeImage, app, type MenuItemConstructorOptions } from 'electron'
import { join } from 'path'
import log from './logger'
import { showSettings } from './windows/settings'
import { updater } from './updater'
import { updateConfig } from './config'
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
  updater.on('changed', () => refreshMenu(overlay))

  return tray
}

export function refreshMenu(overlay: OverlayManager): void {
  if (!tray) return
  const visible = overlay.isVisible()
  const present = overlay.isDisplayPresent()
  const allMuted = overlay.isMutedAll()
  const update = updater.getState()

  const updateItems: MenuItemConstructorOptions[] = []
  if (update.status === 'downloaded' && update.version) {
    updateItems.push(
      {
        label: `Install update v${update.version} and restart`,
        click: () => updater.installNow()
      },
      { type: 'separator' }
    )
  } else if (update.status === 'downloading') {
    const pct = update.progressPercent ?? 0
    const v = update.version ? ` v${update.version}` : ''
    updateItems.push(
      { label: `Downloading update${v}: ${pct}%`, enabled: false },
      { type: 'separator' }
    )
  }

  const menu = Menu.buildFromTemplate([
    ...updateItems,
    {
      label: visible ? 'Hide overlay' : 'Show overlay',
      enabled: present,
      click: () => overlay.setVisible(!visible)
    },
    {
      label: allMuted ? 'Unmute all sources' : 'Mute all sources',
      type: 'checkbox',
      checked: allMuted,
      click: () => {
        const next = !allMuted
        updateConfig((draft) => {
          draft.mutedAll = next
        })
        overlay.setMutedAll(next)
      }
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

  let tooltip = 'Monitor Overlay'
  if (!present) tooltip += ' - display disconnected'
  if (update.status === 'downloaded' && update.version) {
    tooltip += ` - update v${update.version} ready`
  }
  tray.setToolTip(tooltip)
}

export function destroyTray(): void {
  if (tray && !tray.isDestroyed()) tray.destroy()
  tray = null
}
