import { ReactNode } from 'react'
import { Label } from './ui/label'
import { Select } from './ui/select'
import type { DisplayInfo } from '../../../shared/types'

type Props = {
  displays: DisplayInfo[]
  selectedId: number
  present: boolean
  onChange: (id: number) => void
}

export function DisplayPicker({ displays, selectedId, present, onChange }: Props): ReactNode {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Display</Label>
        {!present ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-amber-400">
            Disconnected
          </span>
        ) : null}
      </div>
      <Select value={selectedId} onChange={(e) => onChange(Number(e.target.value))}>
        {displays.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
            {d.isPrimary ? ' - Primary' : ''}
          </option>
        ))}
        {!displays.some((d) => d.id === selectedId) ? (
          <option value={selectedId}>Last selected display (not currently connected)</option>
        ) : null}
      </Select>
    </div>
  )
}
