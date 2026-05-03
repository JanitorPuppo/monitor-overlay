import { ReactNode, useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import type { DisplayInfo, RectConfig } from '../../../shared/types'

type Props = {
  rect: RectConfig
  display: DisplayInfo | undefined
  onChange: (rect: RectConfig) => void
}

type Draft = { x: string; y: string; width: string; height: string }

function rectToDraft(rect: RectConfig, display: DisplayInfo | undefined): Draft {
  if (rect) {
    return {
      x: String(rect.x),
      y: String(rect.y),
      width: String(rect.width),
      height: String(rect.height)
    }
  }
  if (display) {
    return {
      x: '0',
      y: '0',
      width: String(display.workArea.width),
      height: String(display.workArea.height)
    }
  }
  return { x: '0', y: '0', width: '0', height: '0' }
}

function draftToRect(d: Draft): RectConfig {
  const x = Math.max(0, Math.floor(Number(d.x) || 0))
  const y = Math.max(0, Math.floor(Number(d.y) || 0))
  const width = Math.max(1, Math.floor(Number(d.width) || 1))
  const height = Math.max(1, Math.floor(Number(d.height) || 1))
  return { x, y, width, height }
}

export function RectEditor({ rect, display, onChange }: Props): ReactNode {
  const fillMode = rect === null
  const [draft, setDraft] = useState<Draft>(() => rectToDraft(rect, display))

  useEffect(() => {
    setDraft(rectToDraft(rect, display))
  }, [rect, display])

  const setField = (key: keyof Draft, value: string): void => {
    const next = { ...draft, [key]: value }
    setDraft(next)
    onChange(draftToRect(next))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Region</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Fill work area</span>
          <Switch
            checked={fillMode}
            onCheckedChange={(checked) =>
              checked ? onChange(null) : onChange(draftToRect(draft))
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div>
          <Label className="mb-1 block">X</Label>
          <Input
            type="number"
            min={0}
            value={draft.x}
            disabled={fillMode}
            onChange={(e) => setField('x', e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Y</Label>
          <Input
            type="number"
            min={0}
            value={draft.y}
            disabled={fillMode}
            onChange={(e) => setField('y', e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Width</Label>
          <Input
            type="number"
            min={1}
            value={draft.width}
            disabled={fillMode}
            onChange={(e) => setField('width', e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Height</Label>
          <Input
            type="number"
            min={1}
            value={draft.height}
            disabled={fillMode}
            onChange={(e) => setField('height', e.target.value)}
          />
        </div>
      </div>
      {display ? (
        <div className="text-[11px] text-neutral-500">
          Coordinates are relative to {display.label} work area (
          {display.workArea.width}×{display.workArea.height}).
        </div>
      ) : null}
    </div>
  )
}
