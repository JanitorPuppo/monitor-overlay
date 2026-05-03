import { ReactNode, useEffect, useState } from 'react'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import type { SourceConfig } from '../../../shared/types'

type Props = {
  open: boolean
  editing: SourceConfig | null
  onClose: () => void
}

export function SourceDialog({ open, editing, onClose }: Props): ReactNode {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      setUrl(editing?.url ?? '')
      setError(null)
    }
  }, [open, editing])

  const validate = (): string | null => {
    if (!name.trim()) return 'Name is required.'
    if (!url.trim()) return 'URL is required.'
    try {
      const parsed = new URL(url.trim())
      if (!/^https?:$/.test(parsed.protocol)) return 'URL must use http or https.'
    } catch {
      return 'URL is not valid.'
    }
    return null
  }

  const submit = async (): Promise<void> => {
    const e = validate()
    if (e) {
      setError(e)
      return
    }
    setSubmitting(true)
    try {
      if (editing) {
        await window.api.updateSource({
          id: editing.id,
          name: name.trim(),
          url: url.trim()
        })
      } else {
        await window.api.addSource({ name: name.trim(), url: url.trim() })
      }
      onClose()
    } catch (err) {
      setError(String((err as Error)?.message ?? err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? 'Edit source' : 'Add source'}
      description={
        editing
          ? 'Update the URL or display name. Changes are saved when you click Save.'
          : 'Provide a friendly name and the URL to render. The transparent OBS reset CSS is injected automatically.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {editing ? 'Save' : 'Add'}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="source-name">Name</Label>
        <Input
          id="source-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Twitch Chat"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="source-url">URL</Label>
        <Input
          id="source-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/widget?token=..."
          spellCheck={false}
        />
      </div>
      {error ? (
        <div className="rounded-md border border-red-700/60 bg-red-950/40 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      ) : null}
    </Dialog>
  )
}
