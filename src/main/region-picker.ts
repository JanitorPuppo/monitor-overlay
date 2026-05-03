import { BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import pickerHtml from '../../resources/region-picker.html?asset'
import log from './logger'
import type { RectConfig } from '../shared/types'

export type PickResult = {
  displayId: number
  rect: { x: number; y: number; width: number; height: number }
} | null

let activeWindows: BrowserWindow[] = []
let activeResolver: ((result: PickResult) => void) | null = null

let handlersRegistered = false

export function registerRegionPickerHandlers(): void {
  if (handlersRegistered) return
  handlersRegistered = true
  ipcMain.handle(
    'region-picker:submit',
    (_e, displayId: number, rect: { x: number; y: number; width: number; height: number }) => {
      finish({ displayId, rect })
    }
  )
  ipcMain.handle('region-picker:cancel', () => finish(null))
}

export function pickRegion(currentDisplayId: number, currentRect: RectConfig): Promise<PickResult> {
  if (activeResolver) finish(null)
  return new Promise<PickResult>((resolve) => {
    activeResolver = resolve
    const displays = screen.getAllDisplays()
    activeWindows = displays.map((display) => {
      const isCurrent = display.id === currentDisplayId
      const win = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        frame: false,
        transparent: true,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        skipTaskbar: true,
        hasShadow: false,
        thickFrame: false,
        show: false,
        backgroundColor: '#00000000',
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false,
          contextIsolation: true,
          nodeIntegration: false
        }
      })

      win.setAlwaysOnTop(true, 'screen-saver')
      win.setMenu(null)

      const query: Record<string, string> = {
        displayId: String(display.id),
        isCurrent: isCurrent ? '1' : '0',
        workAreaOffsetX: String(display.workArea.x - display.bounds.x),
        workAreaOffsetY: String(display.workArea.y - display.bounds.y),
        workAreaWidth: String(display.workArea.width),
        workAreaHeight: String(display.workArea.height),
        displayLabel: encodeURIComponent(`${display.label || 'Display'} ${display.size.width}\u00d7${display.size.height}`)
      }
      if (isCurrent && currentRect) {
        query.existingX = String(currentRect.x)
        query.existingY = String(currentRect.y)
        query.existingWidth = String(currentRect.width)
        query.existingHeight = String(currentRect.height)
      }

      win.loadFile(pickerHtml, { query }).catch((err) => log.error('picker loadFile failed', err))

      win.once('ready-to-show', () => {
        win.show()
        if (isCurrent) win.focus()
      })

      return win
    })
  })
}

function finish(result: PickResult): void {
  const resolver = activeResolver
  activeResolver = null
  for (const win of activeWindows) {
    if (!win.isDestroyed()) {
      try {
        win.close()
      } catch (err) {
        log.warn('Closing picker window failed', err)
      }
    }
  }
  activeWindows = []
  if (resolver) resolver(result)
}

export function isPicking(): boolean {
  return activeResolver !== null
}
