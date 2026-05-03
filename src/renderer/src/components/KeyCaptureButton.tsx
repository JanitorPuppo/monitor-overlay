import { ReactNode, useEffect } from 'react'
import { cn } from '../lib/utils'

type Props = {
  value: string
  capturing: boolean
  onStartCapture: () => void
  onCapture: (accelerator: string) => void
  onCancel: () => void
}

const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta', 'AltGraph'])

function mapKey(e: KeyboardEvent): string | null {
  const code = e.code

  if (/^Key[A-Z]$/.test(code)) return code.slice(3)
  if (/^Digit[0-9]$/.test(code)) return code.slice(5)
  if (/^Numpad[0-9]$/.test(code)) return 'num' + code.slice(6)
  if (/^F([1-9]|1[0-9]|2[0-4])$/.test(code)) return code

  switch (e.key) {
    case 'ArrowUp':
      return 'Up'
    case 'ArrowDown':
      return 'Down'
    case 'ArrowLeft':
      return 'Left'
    case 'ArrowRight':
      return 'Right'
    case ' ':
      return 'Space'
    case 'Enter':
      return 'Return'
    case 'Tab':
      return 'Tab'
    case 'Backspace':
      return 'Backspace'
    case 'Delete':
      return 'Delete'
    case 'Insert':
      return 'Insert'
    case 'Home':
      return 'Home'
    case 'End':
      return 'End'
    case 'PageUp':
      return 'PageUp'
    case 'PageDown':
      return 'PageDown'
    case 'CapsLock':
      return 'Capslock'
    case 'ScrollLock':
      return 'Scrolllock'
    case 'NumLock':
      return 'Numlock'
    case 'PrintScreen':
      return 'PrintScreen'
    case ',':
    case '.':
    case '/':
    case '\\':
    case "'":
    case ';':
    case '[':
    case ']':
    case '=':
    case '-':
    case '`':
      return e.key
  }

  if (e.key.length === 1) return e.key.toUpperCase()
  return null
}

function buildAccelerator(e: KeyboardEvent, mainKey: string): string {
  const parts: string[] = []
  if (e.ctrlKey) parts.push('Ctrl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')
  if (e.metaKey) parts.push('Super')
  parts.push(mainKey)
  return parts.join('+')
}

function formatBinding(value: string): string {
  if (!value) return ''
  return value
    .split('+')
    .map((p) => p.trim())
    .join(' + ')
}

export function KeyCaptureButton({
  value,
  capturing,
  onStartCapture,
  onCapture,
  onCancel
}: Props): ReactNode {
  useEffect(() => {
    if (!capturing) return
    const onKey = (e: KeyboardEvent): void => {
      e.preventDefault()
      e.stopPropagation()

      if (
        e.key === 'Escape' &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey &&
        !e.metaKey
      ) {
        onCancel()
        return
      }

      if (MODIFIER_KEYS.has(e.key)) return

      const main = mapKey(e)
      if (!main) return
      onCapture(buildAccelerator(e, main))
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [capturing, onCapture, onCancel])

  if (capturing) {
    return (
      <button
        type="button"
        onClick={onCancel}
        className={cn(
          'h-9 min-w-[180px] flex-1 rounded-md border-2 border-cyan-400 bg-cyan-950/40 px-3 text-sm font-mono text-cyan-200 shadow-[0_0_0_2px_rgba(0,255,255,0.15)] animate-pulse'
        )}
      >
        Press a key combo… (Esc to cancel)
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onStartCapture}
      className={cn(
        'h-9 min-w-[180px] flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm font-mono text-neutral-100 transition-colors hover:border-cyan-400/60 hover:bg-neutral-800',
        !value && 'text-neutral-500 italic font-sans'
      )}
    >
      {value ? formatBinding(value) : 'Click to bind'}
    </button>
  )
}
