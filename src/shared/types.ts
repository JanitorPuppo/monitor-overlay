export type SourceConfig = {
  id: string
  name: string
  url: string
  enabled: boolean
  muted: boolean
}

export type RectConfig = {
  x: number
  y: number
  width: number
  height: number
} | null

export type OverlayConfig = {
  id: string
  displayId: number
  rect: RectConfig
  outlineColor: string
  sources: SourceConfig[]
}

export type HotkeyAction = 'toggleVisibility' | 'reloadAll' | 'openSettings'

export type HotkeyConfig = Partial<Record<HotkeyAction, string>>

export type AppConfig = {
  version: 1
  overlays: OverlayConfig[]
  hotkeys: HotkeyConfig
  autostart: boolean
  overlayVisible: boolean
  settingsOpenOnLaunch: boolean
}

export type DisplayInfo = {
  id: number
  label: string
  bounds: { x: number; y: number; width: number; height: number }
  workArea: { x: number; y: number; width: number; height: number }
  isPrimary: boolean
  scaleFactor: number
}

export type SourceStatus = {
  id: string
  loading: boolean
  failed: boolean
  errorMessage?: string
}

export type AppState = {
  config: AppConfig
  displays: DisplayInfo[]
  sourceStatuses: Record<string, SourceStatus>
  overlayActuallyVisible: boolean
  configuredDisplayPresent: boolean
}

export type AddSourceInput = { name: string; url: string }
export type UpdateSourceInput = { id: string; name: string; url: string }

export type IpcChannels = {
  'state:get': () => AppState
  'config:set-display': (displayId: number) => void
  'config:set-rect': (rect: RectConfig) => void
  'config:set-outline-color': (color: string) => void
  'config:add-source': (input: AddSourceInput) => SourceConfig
  'config:update-source': (input: UpdateSourceInput) => void
  'config:remove-source': (id: string) => void
  'config:reorder-sources': (orderedIds: string[]) => void
  'config:toggle-source-enabled': (id: string) => void
  'config:toggle-source-muted': (id: string) => void
  'config:set-hotkey': (action: HotkeyAction, accelerator: string | null) => void
  'config:set-autostart': (enabled: boolean) => void
  'overlay:reload-source': (id: string) => void
  'overlay:reload-all': () => void
  'overlay:toggle-visibility': () => void
  'overlay:open-devtools': (sourceId: string) => void
  'app:quit': () => void
}
