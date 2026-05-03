import { ReactNode } from 'react'
import { useAppState } from './lib/state'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { DisplayPicker } from './components/DisplayPicker'
import { RectEditor } from './components/RectEditor'
import { OutlineColorPicker } from './components/OutlineColorPicker'
import { SourceList } from './components/SourceList'
import { HotkeysSection } from './components/HotkeysSection'
import { AppSection } from './components/AppSection'
import { UpdateBanner } from './components/UpdateBanner'

function App(): ReactNode {
  const state = useAppState()

  if (!state) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-neutral-400">
        Loading…
      </div>
    )
  }

  const overlay = state.config.overlays[0]
  const display = state.displays.find((d) => d.id === overlay.displayId)

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col gap-4 overflow-y-auto p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Monitor Overlay</h1>
          <p className="text-xs text-neutral-400">
            Layered transparent web sources rendered onto your monitor.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={
              state.configuredDisplayPresent
                ? 'rounded bg-emerald-900/40 px-2 py-1 text-emerald-300'
                : 'rounded bg-amber-900/40 px-2 py-1 text-amber-300'
            }
          >
            {state.configuredDisplayPresent
              ? 'Display connected'
              : 'Configured display disconnected'}
          </span>
          <span
            className={
              state.overlayActuallyVisible
                ? 'rounded bg-cyan-900/40 px-2 py-1 text-cyan-300'
                : 'rounded bg-neutral-800 px-2 py-1 text-neutral-400'
            }
          >
            {state.overlayActuallyVisible ? 'Overlay shown' : 'Overlay hidden'}
          </span>
        </div>
      </header>

      <UpdateBanner update={state.update} />

      <Card>
        <CardHeader>
          <CardTitle>Render area</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DisplayPicker
            displays={state.displays}
            selectedId={overlay.displayId}
            present={state.configuredDisplayPresent}
            onChange={(id) => void window.api.setDisplay(id)}
          />
          <RectEditor
            rect={overlay.rect}
            display={display}
            onPickRegion={() => window.api.pickRegion()}
            onResetToFill={() => void window.api.setRect(null)}
          />
          <OutlineColorPicker
            color={overlay.outlineColor}
            enabled={overlay.outlineEnabled}
            onChange={(color) => void window.api.setOutlineColor(color)}
            onEnabledChange={(enabled) => void window.api.setOutlineEnabled(enabled)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <SourceList sources={overlay.sources} statuses={state.sourceStatuses} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <AppSection state={state} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <HotkeysSection hotkeys={state.config.hotkeys} />
        </CardContent>
      </Card>

      <footer className="pb-4 text-center text-[10px] text-neutral-500">
        Click-through is always on; you cannot click into widgets. Sources must use
        self-authenticating URLs.
      </footer>
    </div>
  )
}

export default App
