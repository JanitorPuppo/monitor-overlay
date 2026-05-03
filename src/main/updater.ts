import { autoUpdater } from 'electron-updater'
import log from './logger'

export function setupAutoUpdater(): void {
  autoUpdater.logger = log
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('error', (err) => log.error('Updater error', err))
  autoUpdater.on('update-available', (info) => log.info('Update available', info?.version))
  autoUpdater.on('update-not-available', () => log.info('No updates available'))
  autoUpdater.on('update-downloaded', (info) => log.info('Update downloaded', info?.version))

  autoUpdater.checkForUpdates().catch((err) => log.warn('checkForUpdates failed', err))
  setInterval(
    () => {
      autoUpdater.checkForUpdates().catch((err) => log.warn('Periodic update check failed', err))
    },
    1000 * 60 * 60 * 6
  )
}
