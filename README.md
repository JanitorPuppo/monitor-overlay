# Monitor Overlay

Renders arbitrary URLs as transparent, layered web sources directly onto a chosen monitor (or a sub-region of one). Built for use with [Remote Deck](https://remotedeck.gg), allowing streamers to collaborate with their producers when monitor space is limited. 

## Features

- Loads and renders URLs in the order you specify
- Pick the target display or optionally a select within it
- Always on top, completely click through so you can see whats happening without preventing you from gaming
- Transparent layers, just like OBS does with multiple browser sources layered.
- Per-source enable / mute / reload / DevTools
- Drag-to-reorder layers with live overlay updates
- Configurable colored outline so you can always see when its on and where the overlay lives
- Tray icon + dedicated settings window
- Optional global hotkeys for show/hide, reload-all, open-settings
- Auto-updates

## Constraints

- **Windows-only**
- **No interactivity inside the overlay**

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
