import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'
import log from '../logger'
import { updateConfig } from '../config'

let settingsWindow: BrowserWindow | null = null

export function showSettings(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (settingsWindow.isMinimized()) settingsWindow.restore()
    settingsWindow.show()
    settingsWindow.focus()
    return settingsWindow
  }

  const win = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 720,
    minHeight: 500,
    show: false,
    title: 'Monitor Overlay — Settings',
    autoHideMenuBar: true,
    backgroundColor: '#0b0b0c',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  win.on('ready-to-show', () => {
    win.show()
    updateConfig((draft) => {
      draft.settingsOpenOnLaunch = true
    })
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).catch((err) => log.warn('openExternal failed', err))
    return { action: 'deny' }
  })

  win.on('close', () => {
    updateConfig((draft) => {
      draft.settingsOpenOnLaunch = false
    })
  })

  win.on('closed', () => {
    if (settingsWindow === win) settingsWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  settingsWindow = win
  return win
}

export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow && !settingsWindow.isDestroyed() ? settingsWindow : null
}

export function isSettingsOpen(): boolean {
  return !!getSettingsWindow()
}
