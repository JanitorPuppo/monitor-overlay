import { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Pencil,
  RotateCw,
  Terminal,
  Trash2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { cn } from '../lib/utils'
import type { SourceConfig, SourceStatus } from '../../../shared/types'

type Props = {
  source: SourceConfig
  status: SourceStatus | undefined
  onToggleEnabled: () => void
  onToggleMuted: () => void
  onReload: () => void
  onEdit: () => void
  onRemove: () => void
  onOpenDevtools: () => void
}

export function SourceRow({
  source,
  status,
  onToggleEnabled,
  onToggleMuted,
  onReload,
  onEdit,
  onRemove,
  onOpenDevtools
}: Props): ReactNode {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: source.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  }

  const failed = status?.failed === true
  const loading = status?.loading === true

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/70 p-2',
        failed && 'border-red-700/60'
      )}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab text-neutral-500 hover:text-neutral-200 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div
        className={cn(
          'h-2 w-2 shrink-0 rounded-full',
          failed
            ? 'bg-red-500'
            : loading
              ? 'bg-amber-400 animate-pulse'
              : source.enabled
                ? 'bg-emerald-500'
                : 'bg-neutral-600'
        )}
        title={
          failed
            ? status?.errorMessage || 'Failed to load'
            : loading
              ? 'Loading'
              : source.enabled
                ? 'Active'
                : 'Disabled'
        }
      />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-neutral-100">{source.name}</div>
        <div
          className={cn(
            'truncate text-xs',
            failed ? 'text-red-400' : 'text-neutral-500'
          )}
          title={failed ? status?.errorMessage : source.url}
        >
          {failed ? status?.errorMessage : source.url || '(no URL)'}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMuted}
          title={source.muted ? 'Unmute' : 'Mute'}
        >
          {source.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleEnabled}
          title={source.enabled ? 'Hide source' : 'Show source'}
        >
          {source.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        <Switch checked={source.enabled} onCheckedChange={onToggleEnabled} />
        <Button variant="ghost" size="icon" onClick={onReload} title="Reload">
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenDevtools} title="Open DevTools">
          <Terminal className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit} title="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRemove} title="Remove">
          <Trash2 className="h-4 w-4 text-red-400" />
        </Button>
      </div>
    </div>
  )
}
