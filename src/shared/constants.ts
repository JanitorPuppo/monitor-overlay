export const APP_NAME = 'Monitor Overlay'
export const APP_ID = 'com.janitorpuppo.monitor-overlay'

export const OUTLINE_THICKNESS_PX = 2

export const DEFAULT_OUTLINE_COLOR = '#00FFFF'

export const OBS_RESET_CSS = `
html, body {
  background-color: rgba(0, 0, 0, 0) !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}
body > img:only-child {
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
}
`

export const STATE_UPDATE_CHANNEL = 'state:update'

export const HOTKEY_DEFAULTS = {
  toggleVisibility: 'Ctrl+Alt+O',
  reloadAll: 'Ctrl+Alt+R',
  openSettings: 'Ctrl+Alt+,'
} as const
