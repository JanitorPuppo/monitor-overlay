import { app, ipcMain, BrowserWindow } from 'electron'
import { v4 as uuid } from 'uuid'
import log from './logger'
import { getConfig, updateConfig } from './config'
import { listDisplays, findDisplay } from './displays'
import { applyHotkeys } from './hotkeys'
import { applyAutostart } from './autostart'
import { pickRegion } from './region-picker'
import { updater } from './updater'
import { STATE_UPDATE_CHANNEL } from '../shared/constants'
import type { OverlayManager } from './overlay/manager'
import type {
  AddSourceInput,
  AppState,
  HotkeyAction,
  RectConfig,
  SourceConfig,
  SourceStatus,
  UpdateSourceInput
} from '../shared/types'

type Ctx = {
  overlay: OverlayManager
}

const statusCache: Map<string, SourceStatus> = new Map()

export function buildState(ctx: Ctx): AppState {
  const config = getConfig()
  const displays = listDisplays()
  const overlay = config.overlays[0]
  const configuredDisplayPresent = !!findDisplay(overlay.displayId)
  const sourceStatuses: Record<string, SourceStatus> = {}
  for (const s of overlay.sources) {
    sourceStatuses[s.id] = statusCache.get(s.id) ?? {
      id: s.id,
      loading: false,
      failed: false
    }
  }
  return {
    config,
    displays,
    sourceStatuses,
    overlayActuallyVisible: ctx.overlay.isVisible(),
    configuredDisplayPresent,
    update: updater.getState()
  }
}

export function broadcastState(ctx: Ctx): void {
  const state = buildState(ctx)
  for (const win of BrowserWindow.getAllWindows()) {
    if (win.isDestroyed()) continue
    win.webContents.send(STATE_UPDATE_CHANNEL, state)
  }
}

export function registerIpc(ctx: Ctx): void {
  const { overlay } = ctx

  overlay.on('status', (status: SourceStatus) => {
    statusCache.set(status.id, status)
    broadcastState(ctx)
  })
  overlay.on('changed', () => broadcastState(ctx))
  updater.on('changed', () => broadcastState(ctx))

  ipcMain.handle('state:get', () => buildState(ctx))

  ipcMain.handle('config:set-display', (_e, displayId: number) => {
    updateConfig((draft) => {
      draft.overlays[0].displayId = displayId
    })
    overlay.setOverlay(getConfig().overlays[0])
    broadcastState(ctx)
  })

  ipcMain.handle('config:set-rect', (_e, rect: RectConfig) => {
    updateConfig((draft) => {
      draft.overlays[0].rect = rect
    })
    overlay.setOverlay(getConfig().overlays[0])
    broadcastState(ctx)
  })

  ipcMain.handle('config:set-outline-color', (_e, color: string) => {
    updateConfig((draft) => {
      draft.overlays[0].outlineColor = color
    })
    overlay.setOverlay(getConfig().overlays[0])
    broadcastState(ctx)
  })

  ipcMain.handle('config:set-outline-enabled', (_e, enabled: boolean) => {
    updateConfig((draft) => {
      draft.overlays[0].outlineEnabled = enabled
    })
    overlay.setOverlay(getConfig().overlays[0])
    broadcastState(ctx)
  })

  ipcMain.handle('config:add-source', (_e, input: AddSourceInput): SourceConfig => {
    const source: SourceConfig = {
      id: uuid(),
      name: input.name?.trim() || 'Untitled',
      url: input.url?.trim() || '',
      enabled: true,
      muted: false,
      stretchToFill: false
    }
    updateConfig((draft) => {
      draft.overlays[0].sources.push(source)
    })
    overlay.setOverlay(getConfig().overlays[0])
    broadcastState(ctx)
    return source
  })

  ipcMain.handle('config:update-source', (_e, input: UpdateSourceInput) => {
    updateConfig((draft) => {
      const s = draft.overlays[0].sources.find((x) => x.id === input.id)
      if (!s) return
      s.name = input.name?.trim() || s.name
      s.url = input.url?.trim() || ''
    })
    overlay.setOverlay(getConfig().overlays[0])
    broadcastState(ctx)
  })

  ipcMain.handle('config:remove-source', (_e, id: string) => {
    updateConfig((draft) => {
      draft.overlays[0].sources = draft.overlays[0].sources.filter((x) => x.id !== id)
    })
    statusCache.delete(id)
    overlay.setOverlay(getConfig().overlays[0])
    broadcastState(ctx)
  })

  ipcMain.handle('config:reorder-sources', (_e, orderedIds: string[]) => {
    updateConfig((draft) => {
      const map = new Map(draft.overlays[0].sources.map((s) => [s.id, s]))
      const next: SourceConfig[] = []
      for (const id of orderedIds) {
        const s = map.get(id)
        if (s) {
          next.push(s)
          map.delete(id)
        }
      }
      for (const leftover of map.values()) next.push(leftover)
      draft.overlays[0].sources = next
    })
    overlay.setOverlay(getConfig().overlays[0])
    broadcastState(ctx)
  })

  ipcMain.handle('config:toggle-source-enabled', (_e, id: string) => {
    updateConfig((draft) => {
      const s = draft.overlays[0].sources.find((x) => x.id === id)
      if (s) s.enabled = !s.enabled
    })
    overlay.setOverlay(getConfig().overlays[0])
    broadcastState(ctx)
  })

  ipcMain.handle('config:toggle-source-muted', (_e, id: string) => {
    updateConfig((draft) => {
      const s = draft.overlays[0].sources.find((x) => x.id === id)
      if (s) s.muted = !s.muted
    })
    overlay.setOverlay(getConfig().overlays[0])
    broadcastState(ctx)
  })

  ipcMain.handle('config:toggle-source-stretch', (_e, id: string) => {
    updateConfig((draft) => {
      const s = draft.overlays[0].sources.find((x) => x.id === id)
      if (s) s.stretchToFill = !s.stretchToFill
    })
    overlay.setOverlay(getConfig().overlays[0])
    broadcastState(ctx)
  })

  ipcMain.handle(
    'config:set-hotkey',
    (_e, action: HotkeyAction, accelerator: string | null) => {
      updateConfig((draft) => {
        if (accelerator) draft.hotkeys[action] = accelerator
        else delete draft.hotkeys[action]
      })
      applyHotkeys(getConfig().hotkeys, overlay)
      broadcastState(ctx)
    }
  )

  ipcMain.handle('config:set-autostart', (_e, enabled: boolean) => {
    updateConfig((draft) => {
      draft.autostart = enabled
    })
    applyAutostart(enabled)
    broadcastState(ctx)
  })

  ipcMain.handle('overlay:reload-source', (_e, id: string) => overlay.reloadSource(id))
  ipcMain.handle('overlay:reload-all', () => overlay.reloadAll())
  ipcMain.handle('overlay:toggle-visibility', () => {
    const next = !overlay.isVisible()
    updateConfig((draft) => {
      draft.overlayVisible = next
    })
    overlay.setVisible(next)
    broadcastState(ctx)
  })
  ipcMain.handle('overlay:open-devtools', (_e, id: string) => overlay.openDevtools(id))
  ipcMain.handle('update:check-now', () => void updater.checkNow())
  ipcMain.handle('update:install-now', () => updater.installNow())
  ipcMain.handle('app:quit', () => {
    log.info('Quit from renderer')
    app.quit()
  })

  ipcMain.handle('region:pick', async () => {
    const cfg = getConfig().overlays[0]
    const wasVisible = overlay.isVisible()
    overlay.setVisible(false)
    try {
      const result = await pickRegion(cfg.displayId, cfg.rect)
      if (result) {
        updateConfig((draft) => {
          draft.overlays[0].displayId = result.displayId
          draft.overlays[0].rect = result.rect
        })
        overlay.setOverlay(getConfig().overlays[0])
      }
    } catch (err) {
      log.error('region:pick failed', err)
    } finally {
      overlay.setVisible(wasVisible)
      broadcastState(ctx)
    }
  })
}
