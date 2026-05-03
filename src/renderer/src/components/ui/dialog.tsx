import { ReactNode, useEffect } from 'react'
import { cn } from '../../lib/utils'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className
}: DialogProps): ReactNode {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-900 p-5 shadow-xl',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3">
          <div className="text-base font-semibold text-neutral-100">{title}</div>
          {description ? (
            <div className="mt-1 text-xs text-neutral-400">{description}</div>
          ) : null}
        </div>
        <div className="space-y-3">{children}</div>
        {footer ? <div className="mt-5 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}
