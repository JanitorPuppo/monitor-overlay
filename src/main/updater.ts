import { app, Notification } from 'electron'
import { EventEmitter } from 'events'
import { autoUpdater, type ProgressInfo, type UpdateInfo } from 'electron-updater'
import log from './logger'
import { showSettings } from './windows/settings'
import type { UpdateState } from '../shared/types'

const PERIODIC_CHECK_MS = 1000 * 60 * 60 * 6

class UpdaterController extends EventEmitter {
  private state: UpdateState = { status: 'idle' }
  private notifiedVersion: string | null = null
  private periodicTimer: NodeJS.Timeout | null = null
  private started = false

  start(): void {
    if (this.started) return
    this.started = true

    autoUpdater.logger = log
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('checking-for-update', () => {
      this.set({ status: 'checking' })
    })
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.set({ status: 'downloading', version: info?.version, progressPercent: 0 })
    })
    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      this.set({
        status: 'not-available',
        version: info?.version,
        lastCheckedAt: Date.now()
      })
    })
    autoUpdater.on('download-progress', (p: ProgressInfo) => {
      this.set({
        status: 'downloading',
        version: this.state.version,
        progressPercent: Math.round(p.percent)
      })
    })
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      this.set({
        status: 'downloaded',
        version: info?.version,
        progressPercent: 100,
        lastCheckedAt: Date.now()
      })
      this.notifyDownloaded(info?.version)
    })
    autoUpdater.on('error', (err: Error) => {
      log.error('Updater error', err)
      this.set({
        status: 'error',
        errorMessage: String(err?.message ?? err),
        lastCheckedAt: Date.now()
      })
    })

    void this.checkNow()
    this.periodicTimer = setInterval(() => void this.checkNow(), PERIODIC_CHECK_MS)
  }

  stop(): void {
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer)
      this.periodicTimer = null
    }
  }

  getState(): UpdateState {
    return { ...this.state }
  }

  async checkNow(): Promise<void> {
    if (!this.started) return
    if (this.state.status === 'checking' || this.state.status === 'downloading') return
    try {
      await autoUpdater.checkForUpdates()
    } catch (err) {
      log.warn('checkForUpdates failed', err)
      this.set({
        status: 'error',
        errorMessage: String((err as Error)?.message ?? err),
        lastCheckedAt: Date.now()
      })
    }
  }

  installNow(): void {
    if (this.state.status !== 'downloaded') {
      log.warn('installNow called with no downloaded update', this.state)
      return
    }
    log.info('Installing update and restarting', { version: this.state.version })
    setImmediate(() => autoUpdater.quitAndInstall(false, true))
  }

  markDisabled(reason: string): void {
    this.set({ status: 'disabled', errorMessage: reason })
  }

  private set(next: Partial<UpdateState>): void {
    this.state = { ...this.state, ...next }
    this.emit('changed', this.getState())
  }

  private notifyDownloaded(version: string | undefined): void {
    if (!version || this.notifiedVersion === version) return
    this.notifiedVersion = version
    if (!Notification.isSupported()) return
    try {
      const n = new Notification({
        title: 'Monitor Overlay update ready',
        body: `Version ${version} is downloaded. Click to restart and install.`,
        silent: false
      })
      n.on('click', () => {
        showSettings()
        this.installNow()
      })
      n.show()
    } catch (err) {
      log.warn('Failed to show update notification', err)
    }
  }
}

export const updater = new UpdaterController()

export function setupAutoUpdater(): void {
  if (!app.isPackaged) {
    updater.markDisabled('Auto-updates are disabled in development builds.')
    return
  }
  updater.start()
}
