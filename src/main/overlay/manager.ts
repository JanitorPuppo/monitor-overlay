import { BrowserWindow, WebContentsView } from 'electron'
import { EventEmitter } from 'events'
import log from '../logger'
import { findDisplay } from '../displays'
import { OBS_RESET_CSS, OUTLINE_THICKNESS_PX, STRETCH_FIT_JS } from '../../shared/constants'
import type {
  OverlayConfig,
  RectConfig,
  SourceConfig,
  SourceStatus
} from '../../shared/types'

type SourceRuntime = {
  view: WebContentsView
  status: SourceStatus
}

export class OverlayManager extends EventEmitter {
  private host: BrowserWindow | null = null
  private outlineView: WebContentsView | null = null
  private sources: Map<string, SourceRuntime> = new Map()
  private overlay: OverlayConfig
  private wantsVisible: boolean
  private displayPresent = true

  constructor(overlay: OverlayConfig, initiallyVisible: boolean) {
    super()
    this.overlay = structuredClone(overlay)
    this.wantsVisible = initiallyVisible
  }

  start(): void {
    this.ensureHost()
    this.applyVisibility()
  }

  stop(): void {
    if (this.host && !this.host.isDestroyed()) {
      this.host.destroy()
    }
    this.host = null
    this.outlineView = null
    this.sources.clear()
  }

  setOverlay(next: OverlayConfig): void {
    const prev = this.overlay
    this.overlay = structuredClone(next)

    if (
      prev.displayId !== this.overlay.displayId ||
      !this.rectEqual(prev.rect, this.overlay.rect)
    ) {
      this.repositionHost()
    }
    if (prev.outlineColor !== this.overlay.outlineColor) {
      this.applyOutline()
    }
    this.reconcileSources(prev.sources, this.overlay.sources)
    this.applyVisibility()
  }

  setVisible(visible: boolean): void {
    this.wantsVisible = visible
    this.applyVisibility()
  }

  isVisible(): boolean {
    return this.wantsVisible && this.displayPresent
  }

  isDisplayPresent(): boolean {
    return this.displayPresent
  }

  reloadAll(): void {
    for (const { view } of this.sources.values()) {
      try {
        view.webContents.reload()
      } catch (err) {
        log.error('Reload failed', err)
      }
    }
  }

  reloadSource(id: string): void {
    const rt = this.sources.get(id)
    if (rt) rt.view.webContents.reload()
  }

  openDevtools(id: string): void {
    const rt = this.sources.get(id)
    if (rt) rt.view.webContents.openDevTools({ mode: 'detach' })
  }

  onDisplaysChanged(): void {
    const display = findDisplay(this.overlay.displayId)
    const wasPresent = this.displayPresent
    this.displayPresent = !!display
    if (this.displayPresent !== wasPresent) {
      log.info('Configured display presence changed', {
        present: this.displayPresent,
        displayId: this.overlay.displayId
      })
      this.emit('changed')
    }
    if (this.displayPresent) {
      this.repositionHost()
      this.applyVisibility()
    } else {
      this.applyVisibility()
    }
  }

  getStatuses(): SourceStatus[] {
    return Array.from(this.sources.values()).map((s) => ({ ...s.status }))
  }

  private ensureHost(): void {
    if (this.host && !this.host.isDestroyed()) return
    const rect = this.computeHostRect()
    if (!rect) {
      this.displayPresent = false
      this.emit('changed')
      return
    }
    this.displayPresent = true
    const win = new BrowserWindow({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      frame: false,
      transparent: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
      focusable: false,
      hasShadow: false,
      thickFrame: false,
      show: false,
      backgroundColor: '#00000000',
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    win.setAlwaysOnTop(true, 'screen-saver')
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    win.setIgnoreMouseEvents(true, { forward: true })
    win.setMenu(null)

    win.on('closed', () => {
      this.host = null
      this.outlineView = null
      this.sources.clear()
    })

    this.host = win

    this.installOutline()
    for (const source of [...this.overlay.sources].reverse()) {
      this.addSourceView(source)
    }
    this.applyZOrder()
    this.layoutChildren()
  }

  private installOutline(): void {
    if (!this.host) return
    const view = new WebContentsView({
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false
      }
    })
    view.setBackgroundColor('#00000000')
    this.outlineView = view
    this.host.contentView.addChildView(view)
    view.webContents.loadURL(
      'data:text/html;charset=utf-8,' +
        encodeURIComponent(
          `<!doctype html><html><head><style>
            html,body{margin:0;padding:0;background:transparent;width:100vw;height:100vh;overflow:hidden;pointer-events:none;}
            .frame{box-sizing:border-box;width:100%;height:100%;border-style:solid;border-width:${OUTLINE_THICKNESS_PX}px;border-color:var(--c,#00FFFF);}
          </style></head><body><div class="frame" id="f"></div>
          <script>
            window.addEventListener('message',(e)=>{
              if(e.data&&e.data.type==='outline'){
                document.documentElement.style.setProperty('--c', e.data.color);
              }
            });
          </script></body></html>`
        )
    )
    view.webContents.once('dom-ready', () => this.applyOutline())
  }

  private applyOutline(): void {
    if (!this.outlineView) return
    const color = this.overlay.outlineColor
    this.outlineView.webContents
      .executeJavaScript(
        `document.documentElement.style.setProperty('--c', ${JSON.stringify(color)});`
      )
      .catch(() => {})
  }

  private addSourceView(source: SourceConfig): SourceRuntime {
    if (!this.host) throw new Error('Host not initialized')
    const view = new WebContentsView({
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
        backgroundThrottling: false
      }
    })
    view.setBackgroundColor('#00000000')

    const status: SourceStatus = {
      id: source.id,
      loading: true,
      failed: false
    }
    const rt: SourceRuntime = { view, status }
    this.sources.set(source.id, rt)

    view.webContents.setAudioMuted(source.muted)

    const sourceId = source.id
    view.webContents.on('dom-ready', () => {
      view.webContents.insertCSS(OBS_RESET_CSS).catch(() => {})
      const current = this.overlay.sources.find((s) => s.id === sourceId)
      if (current?.stretchToFill) {
        view.webContents.executeJavaScript(STRETCH_FIT_JS).catch(() => {})
      }
    })
    view.webContents.on('did-start-loading', () => {
      status.loading = true
      status.failed = false
      status.errorMessage = undefined
      this.emit('status', status)
    })
    view.webContents.on('did-stop-loading', () => {
      if (!status.failed) {
        status.loading = false
        this.emit('status', status)
      }
    })
    view.webContents.on('did-finish-load', () => {
      status.loading = false
      status.failed = false
      this.emit('status', status)
    })
    view.webContents.on('did-fail-load', (_e, code, desc, url, isMainFrame) => {
      if (!isMainFrame) return
      status.loading = false
      status.failed = true
      status.errorMessage = `${code}: ${desc} (${url})`
      log.warn('Source failed to load', { id: source.id, code, desc, url })
      this.emit('status', status)
      this.layoutChildren()
    })
    view.webContents.on('render-process-gone', (_e, details) => {
      status.failed = true
      status.errorMessage = `Renderer crashed: ${details.reason}`
      this.emit('status', status)
      this.layoutChildren()
    })

    if (source.enabled && source.url) {
      view.webContents.loadURL(source.url).catch((err) => {
        status.loading = false
        status.failed = true
        status.errorMessage = String(err?.message ?? err)
        this.emit('status', status)
      })
    }

    this.host.contentView.addChildView(view)
    return rt
  }

  private removeSourceView(id: string): void {
    const rt = this.sources.get(id)
    if (!rt) return
    if (this.host && !this.host.isDestroyed()) {
      this.host.contentView.removeChildView(rt.view)
    }
    rt.view.webContents.close()
    this.sources.delete(id)
  }

  private reconcileSources(prev: SourceConfig[], next: SourceConfig[]): void {
    if (!this.host) return
    const nextById = new Map(next.map((s) => [s.id, s]))
    const prevById = new Map(prev.map((s) => [s.id, s]))

    for (const id of prevById.keys()) {
      if (!nextById.has(id)) this.removeSourceView(id)
    }

    for (const source of next) {
      const existing = this.sources.get(source.id)
      const prevSource = prevById.get(source.id)
      if (!existing) {
        this.addSourceView(source)
        continue
      }

      existing.view.webContents.setAudioMuted(source.muted)

      const urlChanged = prevSource ? prevSource.url !== source.url : false
      const enabledChanged = prevSource ? prevSource.enabled !== source.enabled : false
      const stretchChanged = prevSource
        ? prevSource.stretchToFill !== source.stretchToFill
        : false

      if (enabledChanged && !source.enabled) {
        try {
          existing.view.webContents.stop()
          existing.view.webContents.loadURL('about:blank').catch(() => {})
        } catch {
          /* ignore */
        }
      }
      const needsReload =
        (enabledChanged && source.enabled) ||
        (urlChanged && source.enabled) ||
        (stretchChanged && source.enabled)
      if (needsReload) {
        if (source.url) {
          existing.status.loading = true
          existing.status.failed = false
          existing.status.errorMessage = undefined
          this.emit('status', existing.status)
          existing.view.webContents.loadURL(source.url).catch((err) => {
            existing.status.loading = false
            existing.status.failed = true
            existing.status.errorMessage = String(err?.message ?? err)
            this.emit('status', existing.status)
          })
        }
      }
    }

    this.applyZOrder()
    this.layoutChildren()
  }

  private applyZOrder(): void {
    if (!this.host) return
    for (const source of [...this.overlay.sources].reverse()) {
      const rt = this.sources.get(source.id)
      if (!rt) continue
      this.host.contentView.removeChildView(rt.view)
      this.host.contentView.addChildView(rt.view)
    }
    if (this.outlineView) {
      this.host.contentView.removeChildView(this.outlineView)
      this.host.contentView.addChildView(this.outlineView)
    }
  }

  private layoutChildren(): void {
    if (!this.host) return
    const [w, h] = this.host.getContentSize()
    const fullRect = { x: 0, y: 0, width: w, height: h }
    const hiddenRect = { x: 0, y: 0, width: 0, height: 0 }

    for (const source of this.overlay.sources) {
      const rt = this.sources.get(source.id)
      if (!rt) continue
      const visible = source.enabled && !rt.status.failed
      rt.view.setBounds(visible ? fullRect : hiddenRect)
    }
    if (this.outlineView) {
      this.outlineView.setBounds(this.overlay.outlineEnabled ? fullRect : hiddenRect)
    }
  }

  private computeHostRect(): { x: number; y: number; width: number; height: number } | null {
    const display = findDisplay(this.overlay.displayId)
    if (!display) return null
    if (this.overlay.rect) {
      return {
        x: display.workArea.x + this.overlay.rect.x,
        y: display.workArea.y + this.overlay.rect.y,
        width: Math.max(1, this.overlay.rect.width),
        height: Math.max(1, this.overlay.rect.height)
      }
    }
    return { ...display.workArea }
  }

  private repositionHost(): void {
    if (!this.host || this.host.isDestroyed()) {
      this.ensureHost()
      return
    }
    const rect = this.computeHostRect()
    if (!rect) {
      this.displayPresent = false
      this.applyVisibility()
      return
    }
    this.displayPresent = true
    this.host.setBounds(rect)
    this.layoutChildren()
  }

  private applyVisibility(): void {
    if (!this.host || this.host.isDestroyed()) {
      if (this.wantsVisible && this.displayPresent) this.ensureHost()
      return
    }
    const shouldShow = this.wantsVisible && this.displayPresent
    if (shouldShow) {
      if (!this.host.isVisible()) {
        this.host.showInactive()
        this.host.setAlwaysOnTop(true, 'screen-saver')
      }
    } else {
      if (this.host.isVisible()) this.host.hide()
    }
    this.emit('changed')
  }

  private rectEqual(a: RectConfig, b: RectConfig): boolean {
    if (a === null && b === null) return true
    if (a === null || b === null) return false
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  }
}
