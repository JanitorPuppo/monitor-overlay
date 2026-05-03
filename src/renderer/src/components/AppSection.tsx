import { ReactNode } from 'react'
import { Switch } from './ui/switch'
import { Button } from './ui/button'
import { LogOut, RotateCw, RefreshCw } from 'lucide-react'
import type { AppState } from '../../../shared/types'

type Props = { state: AppState }

export function AppSection({ state }: Props): ReactNode {
  const { config, overlayActuallyVisible, update } = state
  const updateBusy = update.status === 'checking' || update.status === 'downloading'

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-semibold text-neutral-100">App</div>
        <div className="text-xs text-neutral-400">Lifecycle and global controls.</div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-neutral-800 px-3 py-2">
        <div>
          <div className="text-sm text-neutral-100">Overlay visible</div>
          <div className="text-xs text-neutral-400">
            {overlayActuallyVisible ? 'Currently shown.' : 'Currently hidden.'}
          </div>
        </div>
        <Switch
          checked={overlayActuallyVisible}
          onCheckedChange={() => void window.api.toggleVisibility()}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border border-neutral-800 px-3 py-2">
        <div>
          <div className="text-sm text-neutral-100">Start with Windows</div>
          <div className="text-xs text-neutral-400">Launch hidden in tray on login.</div>
        </div>
        <Switch
          checked={config.autostart}
          onCheckedChange={(checked) => void window.api.setAutostart(checked)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => void window.api.reloadAll()}>
          <RotateCw className="h-4 w-4" /> Reload all sources
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void window.api.checkForUpdates()}
          disabled={updateBusy || update.status === 'disabled'}
          title={update.status === 'disabled' ? update.errorMessage : undefined}
        >
          <RefreshCw className="h-4 w-4" /> Check for updates
        </Button>
        <Button variant="outline" size="sm" onClick={() => void window.api.quit()}>
          <LogOut className="h-4 w-4" /> Quit app
        </Button>
      </div>
    </div>
  )
}
