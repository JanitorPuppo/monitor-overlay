import { ReactNode, useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { cn } from '../lib/utils'

type Props = {
  color: string
  enabled: boolean
  onChange: (color: string) => void
  onEnabledChange: (enabled: boolean) => void
}

const PRESETS = ['#00FFFF', '#FF00FF', '#00FF00', '#FFFFFF', '#FFA500', '#FF0044']

function normalize(hex: string): string {
  const v = hex.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toUpperCase()
  return ''
}

export function OutlineColorPicker({
  color,
  enabled,
  onChange,
  onEnabledChange
}: Props): ReactNode {
  const [text, setText] = useState(color)

  useEffect(() => {
    setText(color)
  }, [color])

  const commit = (raw: string): void => {
    const v = normalize(raw)
    if (v) onChange(v)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Outline</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">
            {enabled ? 'Visible' : 'Hidden'}
          </span>
          <Switch checked={enabled} onCheckedChange={onEnabledChange} />
        </div>
      </div>
      <div
        className={cn(
          'space-y-2 transition-opacity',
          !enabled && 'pointer-events-none opacity-40'
        )}
        aria-hidden={!enabled}
      >
        <div className="flex items-center gap-2">
          <input
            aria-label="Color picker"
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="h-9 w-12 rounded-md border border-neutral-700"
            disabled={!enabled}
          />
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit((e.target as HTMLInputElement).value)
            }}
            className="font-mono"
            maxLength={7}
            disabled={!enabled}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              title={p}
              onClick={() => onChange(p)}
              disabled={!enabled}
              className="h-6 w-6 rounded border border-neutral-700 transition-transform hover:scale-110 disabled:cursor-not-allowed"
              style={{ background: p }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
