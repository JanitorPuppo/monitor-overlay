import { ReactNode, useState } from 'react'
import { RotateCcw, X } from 'lucide-react'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { KeyCaptureButton } from './KeyCaptureButton'
import { HOTKEY_DEFAULTS } from '../../../shared/constants'
import type { HotkeyAction, HotkeyConfig } from '../../../shared/types'

const ROWS: { action: HotkeyAction; label: string }[] = [
  { action: 'toggleVisibility', label: 'Toggle overlay visibility' },
  { action: 'reloadAll', label: 'Reload all sources' },
  { action: 'openSettings', label: 'Open settings' },
  { action: 'muteAllToggle', label: 'Mute all sources (toggle)' }
]

type Props = { hotkeys: HotkeyConfig }

export function HotkeysSection({ hotkeys }: Props): ReactNode {
  const [capturingAction, setCapturingAction] = useState<HotkeyAction | null>(null)

  const setBinding = (action: HotkeyAction, accelerator: string | null): void => {
    void window.api.setHotkey(action, accelerator)
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-semibold text-neutral-100">Hotkeys</div>
        <div className="text-xs text-neutral-400">
          Click a binding to capture a new key combo. Defaults are filled in for fresh installs.
        </div>
      </div>

      <div className="space-y-2">
        {ROWS.map(({ action, label }) => {
          const value = hotkeys[action] ?? ''
          const defaultValue = HOTKEY_DEFAULTS[action]
          const isDefault = value === defaultValue
          const isCapturingThis = capturingAction === action
          return (
            <div key={action} className="flex items-center gap-2">
              <Label className="w-48 normal-case tracking-normal text-neutral-300">
                {label}
              </Label>
              <KeyCaptureButton
                value={value}
                capturing={isCapturingThis}
                onStartCapture={() => setCapturingAction(action)}
                onCapture={(accelerator) => {
                  setBinding(action, accelerator)
                  setCapturingAction(null)
                }}
                onCancel={() => setCapturingAction(null)}
              />
              <Button
                variant="ghost"
                size="icon"
                title={`Reset to default (${defaultValue})`}
                onClick={() => setBinding(action, defaultValue)}
                disabled={isDefault}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Clear binding"
                onClick={() => setBinding(action, null)}
                disabled={!value}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
