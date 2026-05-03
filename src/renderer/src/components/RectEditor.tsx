import { ReactNode, useState } from 'react'
import { Crop, RotateCcw } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import type { DisplayInfo, RectConfig } from '../../../shared/types'

type Props = {
  rect: RectConfig
  display: DisplayInfo | undefined
  onPickRegion: () => Promise<void>
  onResetToFill: () => void
}

export function RectEditor({ rect, display, onPickRegion, onResetToFill }: Props): ReactNode {
  const [picking, setPicking] = useState(false)

  const startPick = async (): Promise<void> => {
    setPicking(true)
    try {
      await onPickRegion()
    } finally {
      setPicking(false)
    }
  }

  const summary = ((): { headline: string; sub: string | null } => {
    if (!display) {
      return { headline: 'Display unavailable', sub: 'Reconnect the configured display.' }
    }
    if (rect === null) {
      return {
        headline: `Filling work area · ${display.workArea.width}×${display.workArea.height}`,
        sub: 'No custom region. Pick one to constrain the overlay to a sub-region.'
      }
    }
    return {
      headline: `Custom region · ${rect.width}×${rect.height} at (${rect.x}, ${rect.y})`,
      sub: `Relative to the work area of ${display.label}.`
    }
  })()

  return (
    <div className="space-y-3">
      <Label>Region</Label>
      <div className="rounded-md border border-neutral-800 bg-neutral-900/40 p-3">
        <div className="text-sm text-neutral-100">{summary.headline}</div>
        {summary.sub ? (
          <div className="mt-0.5 text-xs text-neutral-400">{summary.sub}</div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={startPick} disabled={picking} size="sm">
          <Crop className="h-4 w-4" />
          {picking ? 'Picking on screen…' : rect ? 'Re-pick region' : 'Pick region on screen'}
        </Button>
        {rect ? (
          <Button variant="outline" onClick={onResetToFill} disabled={picking} size="sm">
            <RotateCcw className="h-4 w-4" />
            Reset to fill work area
          </Button>
        ) : null}
      </div>
      <p className="text-[11px] text-neutral-500">
        The picker covers every connected display. Click and drag to draw the region; the
        overlay will move to whichever display you draw on.
      </p>
    </div>
  )
}
