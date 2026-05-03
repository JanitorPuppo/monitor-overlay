export const APP_NAME = 'Monitor Overlay'
export const APP_ID = 'com.janitorpuppo.monitor-overlay'

export const OUTLINE_THICKNESS_PX = 2

export const DEFAULT_OUTLINE_COLOR = '#00FFFF'

export const OBS_RESET_CSS = `
body {
  background-color: rgba(0, 0, 0, 0) !important;
  margin: 0px auto !important;
  overflow: hidden !important;
}
html {
  background-color: rgba(0, 0, 0, 0) !important;
}
`

export const STATE_UPDATE_CHANNEL = 'state:update'

export const HOTKEY_DEFAULTS = {
  toggleVisibility: 'Ctrl+Alt+O',
  reloadAll: 'Ctrl+Alt+R',
  openSettings: 'Ctrl+Alt+,'
} as const
