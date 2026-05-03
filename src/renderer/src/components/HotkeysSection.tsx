import { ReactNode, useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { X } from 'lucide-react'
import type { HotkeyAction, HotkeyConfig } from '../../../shared/types'

const ROWS: { action: HotkeyAction; label: string; placeholder: string }[] = [
  { action: 'toggleVisibility', label: 'Toggle overlay visibility', placeholder: 'Ctrl+Alt+O' },
  { action: 'reloadAll', label: 'Reload all sources', placeholder: 'Ctrl+Alt+R' },
  { action: 'openSettings', label: 'Open settings', placeholder: 'Ctrl+Alt+,' }
]

type Props = { hotkeys: HotkeyConfig }

export function HotkeysSection({ hotkeys }: Props): ReactNode {
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const commit = (action: HotkeyAction, raw: string): void => {
    const v = raw.trim()
    void window.api.setHotkey(action, v.length > 0 ? v : null)
  }

  return (
    <div className="space-y-2">
      <div>
        <div className="text-sm font-semibold text-neutral-100">Hotkeys</div>
        <div className="text-xs text-neutral-400">
          Optional global shortcuts. Use Electron accelerator format (e.g. Ctrl+Alt+O,
          CommandOrControl+Shift+R).
        </div>
      </div>
      {ROWS.map(({ action, label, placeholder }) => {
        const current = drafts[action] ?? hotkeys[action] ?? ''
        return (
          <div key={action} className="flex items-center gap-2">
            <Label className="w-48 normal-case tracking-normal text-neutral-300">{label}</Label>
            <Input
              value={current}
              placeholder={placeholder}
              onChange={(e) => setDrafts((d) => ({ ...d, [action]: e.target.value }))}
              onBlur={(e) => commit(action, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit(action, (e.target as HTMLInputElement).value)
              }}
              className="font-mono"
            />
            <Button
              variant="ghost"
              size="icon"
              title="Clear"
              onClick={() => {
                setDrafts((d) => ({ ...d, [action]: '' }))
                void window.api.setHotkey(action, null)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
