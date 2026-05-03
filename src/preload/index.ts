import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { STATE_UPDATE_CHANNEL } from '../shared/constants'
import type {
  AddSourceInput,
  AppState,
  HotkeyAction,
  RectConfig,
  SourceConfig,
  UpdateSourceInput
} from '../shared/types'

const api = {
  getState: (): Promise<AppState> => ipcRenderer.invoke('state:get'),
  setDisplay: (displayId: number): Promise<void> =>
    ipcRenderer.invoke('config:set-display', displayId),
  setRect: (rect: RectConfig): Promise<void> => ipcRenderer.invoke('config:set-rect', rect),
  setOutlineColor: (color: string): Promise<void> =>
    ipcRenderer.invoke('config:set-outline-color', color),
  setOutlineEnabled: (enabled: boolean): Promise<void> =>
    ipcRenderer.invoke('config:set-outline-enabled', enabled),
  addSource: (input: AddSourceInput): Promise<SourceConfig> =>
    ipcRenderer.invoke('config:add-source', input),
  updateSource: (input: UpdateSourceInput): Promise<void> =>
    ipcRenderer.invoke('config:update-source', input),
  removeSource: (id: string): Promise<void> => ipcRenderer.invoke('config:remove-source', id),
  reorderSources: (orderedIds: string[]): Promise<void> =>
    ipcRenderer.invoke('config:reorder-sources', orderedIds),
  toggleSourceEnabled: (id: string): Promise<void> =>
    ipcRenderer.invoke('config:toggle-source-enabled', id),
  toggleSourceMuted: (id: string): Promise<void> =>
    ipcRenderer.invoke('config:toggle-source-muted', id),
  toggleSourceStretch: (id: string): Promise<void> =>
    ipcRenderer.invoke('config:toggle-source-stretch', id),
  setHotkey: (action: HotkeyAction, accelerator: string | null): Promise<void> =>
    ipcRenderer.invoke('config:set-hotkey', action, accelerator),
  setAutostart: (enabled: boolean): Promise<void> =>
    ipcRenderer.invoke('config:set-autostart', enabled),
  setMutedAll: (enabled: boolean): Promise<void> =>
    ipcRenderer.invoke('config:set-muted-all', enabled),
  reloadSource: (id: string): Promise<void> => ipcRenderer.invoke('overlay:reload-source', id),
  reloadAll: (): Promise<void> => ipcRenderer.invoke('overlay:reload-all'),
  toggleVisibility: (): Promise<void> => ipcRenderer.invoke('overlay:toggle-visibility'),
  openDevtools: (sourceId: string): Promise<void> =>
    ipcRenderer.invoke('overlay:open-devtools', sourceId),
  checkForUpdates: (): Promise<void> => ipcRenderer.invoke('update:check-now'),
  installUpdateNow: (): Promise<void> => ipcRenderer.invoke('update:install-now'),
  quit: (): Promise<void> => ipcRenderer.invoke('app:quit'),
  pickRegion: (): Promise<void> => ipcRenderer.invoke('region:pick'),
  regionPickerSubmit: (
    displayId: number,
    rect: { x: number; y: number; width: number; height: number }
  ): Promise<void> => ipcRenderer.invoke('region-picker:submit', displayId, rect),
  regionPickerCancel: (): Promise<void> => ipcRenderer.invoke('region-picker:cancel'),
  onStateUpdate: (handler: (state: AppState) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, state: AppState): void => handler(state)
    ipcRenderer.on(STATE_UPDATE_CHANNEL, listener)
    return () => ipcRenderer.removeListener(STATE_UPDATE_CHANNEL, listener)
  }
}

export type AppApi = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
