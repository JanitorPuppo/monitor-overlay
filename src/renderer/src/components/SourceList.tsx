import { ReactNode, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from './ui/button'
import { SourceRow } from './SourceRow'
import { SourceDialog } from './SourceDialog'
import type { SourceConfig, SourceStatus } from '../../../shared/types'

type Props = {
  sources: SourceConfig[]
  statuses: Record<string, SourceStatus>
}

export function SourceList({ sources, statuses }: Props): ReactNode {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SourceConfig | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sources.findIndex((s) => s.id === active.id)
    const newIndex = sources.findIndex((s) => s.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(sources, oldIndex, newIndex)
    void window.api.reorderSources(next.map((s) => s.id))
  }

  const openAdd = (): void => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (source: SourceConfig): void => {
    setEditing(source)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-neutral-100">Sources</div>
          <div className="text-xs text-neutral-400">
            Top of the list renders behind; bottom renders in front.
          </div>
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4" /> Add source
        </Button>
      </div>

      {sources.length === 0 ? (
        <div className="rounded-md border border-dashed border-neutral-700 p-6 text-center text-sm text-neutral-400">
          No sources yet. Click <span className="text-neutral-200">Add source</span> to render
          your first URL.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sources.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sources.map((source) => (
                <SourceRow
                  key={source.id}
                  source={source}
                  status={statuses[source.id]}
                  onToggleEnabled={() => void window.api.toggleSourceEnabled(source.id)}
                  onToggleMuted={() => void window.api.toggleSourceMuted(source.id)}
                  onReload={() => void window.api.reloadSource(source.id)}
                  onEdit={() => openEdit(source)}
                  onRemove={() => void window.api.removeSource(source.id)}
                  onOpenDevtools={() => void window.api.openDevtools(source.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <SourceDialog
        open={dialogOpen}
        editing={editing}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  )
}
