import { ReactNode, useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'

type Props = {
  color: string
  onChange: (color: string) => void
}

const PRESETS = ['#00FFFF', '#FF00FF', '#00FF00', '#FFFFFF', '#FFA500', '#FF0044']

function normalize(hex: string): string {
  const v = hex.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toUpperCase()
  return ''
}

export function OutlineColorPicker({ color, onChange }: Props): ReactNode {
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
      <Label>Outline color</Label>
      <div className="flex items-center gap-2">
        <input
          aria-label="Color picker"
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-9 w-12 rounded-md border border-neutral-700"
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
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            title={p}
            onClick={() => onChange(p)}
            className="h-6 w-6 rounded border border-neutral-700 transition-transform hover:scale-110"
            style={{ background: p }}
          />
        ))}
      </div>
    </div>
  )
}
