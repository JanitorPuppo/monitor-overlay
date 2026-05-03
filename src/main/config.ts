import { app, screen } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'
import { v4 as uuid } from 'uuid'
import log from './logger'
import { DEFAULT_OUTLINE_COLOR, HOTKEY_DEFAULTS } from '../shared/constants'
import type { AppConfig, OverlayConfig } from '../shared/types'

const CONFIG_FILENAME = 'config.json'

let cached: AppConfig | null = null
let writeQueue: Promise<void> = Promise.resolve()

function configPath(): string {
  return join(app.getPath('userData'), CONFIG_FILENAME)
}

function defaultOverlay(): OverlayConfig {
  const primary = screen.getPrimaryDisplay()
  return {
    id: uuid(),
    displayId: primary.id,
    rect: null,
    outlineColor: DEFAULT_OUTLINE_COLOR,
    sources: []
  }
}

function defaultHotkeys(): AppConfig['hotkeys'] {
  return { ...HOTKEY_DEFAULTS }
}

function defaultConfig(): AppConfig {
  return {
    version: 1,
    overlays: [defaultOverlay()],
    hotkeys: defaultHotkeys(),
    autostart: false,
    overlayVisible: true,
    settingsOpenOnLaunch: true
  }
}

function migrate(raw: unknown): AppConfig {
  const base = defaultConfig()
  if (!raw || typeof raw !== 'object') return base
  const obj = raw as Partial<AppConfig> & Record<string, unknown>
  const userHotkeys = obj.hotkeys
  const hotkeysIsEmpty =
    !userHotkeys ||
    typeof userHotkeys !== 'object' ||
    Object.keys(userHotkeys as object).length === 0
  return {
    version: 1,
    overlays:
      Array.isArray(obj.overlays) && obj.overlays.length > 0
        ? (obj.overlays as OverlayConfig[]).map((o) => ({
            id: o.id ?? uuid(),
            displayId: o.displayId ?? base.overlays[0].displayId,
            rect: o.rect ?? null,
            outlineColor: o.outlineColor ?? DEFAULT_OUTLINE_COLOR,
            sources: Array.isArray(o.sources)
              ? o.sources.map((s) => ({
                  id: s.id ?? uuid(),
                  name: s.name ?? 'Untitled',
                  url: s.url ?? '',
                  enabled: s.enabled ?? true,
                  muted: s.muted ?? false,
                  stretchToFill: s.stretchToFill ?? false
                }))
              : []
          }))
        : base.overlays,
    hotkeys: hotkeysIsEmpty ? defaultHotkeys() : userHotkeys,
    autostart: obj.autostart ?? false,
    overlayVisible: obj.overlayVisible ?? true,
    settingsOpenOnLaunch: obj.settingsOpenOnLaunch ?? true
  }
}

export async function loadConfig(): Promise<AppConfig> {
  if (cached) return cached
  const path = configPath()
  try {
    const text = await fs.readFile(path, 'utf-8')
    const parsed = JSON.parse(text)
    cached = migrate(parsed)
    log.info('Loaded config from', path)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      cached = defaultConfig()
      log.info('No config found, using defaults at', path)
      void persist(cached)
    } else {
      log.error('Failed to load config; using defaults', err)
      cached = defaultConfig()
    }
  }
  return cached
}

async function persist(config: AppConfig): Promise<void> {
  const path = configPath()
  const tmp = `${path}.tmp`
  const text = JSON.stringify(config, null, 2)
  await fs.writeFile(tmp, text, 'utf-8')
  await fs.rename(tmp, path)
}

export function getConfig(): AppConfig {
  if (!cached) throw new Error('Config not loaded yet')
  return cached
}

export function updateConfig(mutator: (draft: AppConfig) => void): AppConfig {
  if (!cached) throw new Error('Config not loaded yet')
  mutator(cached)
  const snapshot = structuredClone(cached)
  writeQueue = writeQueue.then(() =>
    persist(snapshot).catch((err) => log.error('Failed to persist config', err))
  )
  return cached
}

export function isFirstRun(config: AppConfig): boolean {
  return config.overlays.length === 1 && config.overlays[0].sources.length === 0
}
