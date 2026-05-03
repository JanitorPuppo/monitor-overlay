# Monitor Overlay

Renders arbitrary URLs as transparent, layered web sources directly onto a chosen monitor (or a sub-region of one). Built for OBS-style browser-source widgets — chat boxes, alerts, dashboards — overlaid on the desktop instead of inside OBS.

## Features

- Multiple URLs stacked as full-bleed transparent layers (top of list → behind, bottom → in front)
- Pick the target display + an optional rect within it
- Always click-through and always-on-top (above fullscreen apps)
- OBS reset CSS (`body { background: rgba(0,0,0,0); margin: 0 auto; overflow: hidden; }`) auto-injected on every load
- Per-source enable / mute / reload / DevTools
- Drag-to-reorder z-order with live overlay updates
- Cyan outline (configurable color) so you can always see where the overlay lives
- Tray icon + dedicated settings window (no manual JSON editing)
- Optional global hotkeys for show/hide, reload-all, open-settings
- Auto-update via GitHub Releases
- Auto-hides when the configured display is disconnected; auto-restores when it returns

## Constraints

- **Windows-only** (NSIS installer)
- **No interactivity inside the overlay** — sources must be self-authenticating (tokenized URLs); login flows do not work
- **No code signing** in the published builds — Windows SmartScreen will warn on first install and on auto-updates

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build:win
```

## Publish a release

Set `GH_TOKEN` to a GitHub PAT with `repo` scope, bump `version` in `package.json`, then:

```bash
npm run publish:win
```
