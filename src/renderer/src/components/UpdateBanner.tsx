import { ReactNode } from 'react'
import { Download, RefreshCw, RotateCw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import type { UpdateState } from '../../../shared/types'

type Props = { update: UpdateState }

type Tone = 'info' | 'success' | 'error' | 'muted'

const toneClass: Record<Tone, string> = {
  info: 'border-cyan-700/60 bg-cyan-950/30 text-cyan-100',
  success: 'border-emerald-700/60 bg-emerald-950/30 text-emerald-100',
  error: 'border-red-700/60 bg-red-950/30 text-red-100',
  muted: 'border-neutral-800 bg-neutral-900/40 text-neutral-300'
}

export function UpdateBanner({ update }: Props): ReactNode {
  const view = describe(update)
  if (!view) return null

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border px-3 py-2 text-sm',
        toneClass[view.tone]
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">{view.icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{view.title}</div>
        {view.subtitle ? (
          <div className="truncate text-xs opacity-80">{view.subtitle}</div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {view.actions.map((a) => (
          <Button key={a.label} size="sm" variant={a.variant} onClick={a.onClick}>
            {a.icon}
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

type Action = {
  label: string
  icon?: ReactNode
  variant: 'default' | 'secondary' | 'outline' | 'ghost'
  onClick: () => void
}

type ViewModel = {
  tone: Tone
  icon: ReactNode
  title: string
  subtitle?: string
  actions: Action[]
}

function describe(update: UpdateState): ViewModel | null {
  const checkAction: Action = {
    label: 'Check now',
    icon: <RefreshCw className="h-4 w-4" />,
    variant: 'outline',
    onClick: () => void window.api.checkForUpdates()
  }

  switch (update.status) {
    case 'downloaded':
      return {
        tone: 'success',
        icon: <Download className="h-5 w-5" />,
        title: `Update ready: v${update.version ?? ''}`,
        subtitle: 'Restart to install the new version. Sources will reload automatically.',
        actions: [
          {
            label: 'Restart and install',
            icon: <RotateCw className="h-4 w-4" />,
            variant: 'default',
            onClick: () => void window.api.installUpdateNow()
          }
        ]
      }
    case 'downloading':
      return {
        tone: 'info',
        icon: <Download className="h-5 w-5 animate-pulse" />,
        title: `Downloading update${update.version ? ` v${update.version}` : ''}`,
        subtitle:
          update.progressPercent != null ? `${update.progressPercent}% complete` : 'Starting download…',
        actions: []
      }
    case 'checking':
      return {
        tone: 'muted',
        icon: <RefreshCw className="h-5 w-5 animate-spin" />,
        title: 'Checking for updates…',
        actions: []
      }
    case 'error':
      return {
        tone: 'error',
        icon: <AlertTriangle className="h-5 w-5" />,
        title: 'Update check failed',
        subtitle: update.errorMessage,
        actions: [checkAction]
      }
    case 'disabled':
      return {
        tone: 'muted',
        icon: <CheckCircle2 className="h-5 w-5" />,
        title: 'Auto-updates disabled',
        subtitle: update.errorMessage,
        actions: []
      }
    case 'available':
    case 'not-available':
    case 'idle':
    default:
      return null
  }
}
