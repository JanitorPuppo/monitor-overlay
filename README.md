# Monitor Overlay

Renders arbitrary URLs as transparent, layered web sources directly onto a chosen monitor (or a sub-region of one). Built for a cool use case found in [Remote Deck](https://remotedeck.gg), allowing streamers to collaborate with their producers when monitor space is limited. Also works with Stream elements overlays and any other websites you can think of.

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

Releases are cut by GitHub Actions on tag push (see `.github/workflows/release.yml`).
The workflow installs deps, verifies the tag matches `package.json`, and runs
`npm run publish:win` with the runner's auto-injected `GITHUB_TOKEN`.

```powershell
# 1. Bump version in package.json (no leading "v")
# 2. Commit the bump
git commit -am "Bump to 0.2.0"

# 3. Tag and push
git tag v0.2.0
git push origin main --tags
```

The Actions run uploads `monitor-overlay-<version>-setup.exe`, `latest.yml`, and
the `.blockmap` to the corresponding GitHub Release. Installed copies pick up the
new version on their next `electron-updater` check (every 6 hours, or on launch).

To publish locally instead (no Actions), source a token from the `gh` CLI:

```powershell
$env:GH_TOKEN = (gh auth token)
npm run publish:win
```
