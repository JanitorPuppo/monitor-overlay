# Monitor Overlay

Renders arbitrary URLs just like OBS, allowing for layered web sources directly onto a chosen monitor (or a selected region). Works with every overlay you'd normally use in OBS, allowing you to see what chat sees without having to see OBS.

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

## Installing

The installer is currently unsigned, so Windows SmartScreen will block it on first run. This is normal for new and unsigned applications. Windows SmartScreen is informing you that it doesn't know what this application is.

To install:

1. Download `monitor-overlay-<version>-setup.exe` from the [Releases page](https://github.com/JanitorPuppo/monitor-overlay/releases/latest).
2. Double-click the installer. SmartScreen will say *"Windows protected your PC"*.
3. Click **More info**, then **Run anyway**.
4. **Known quirk:** clicking *Run anyway* sometimes only unblocks the file without launching it. If nothing happens, double-click the installer a second time and it will start normally. This is a Windows behaviour for unsigned installers and does not affect the installed app.

After install the app lives in the system tray. Closing the Settings window does not quit the app; use the tray's **Quit** menu item to fully exit.

## Updates

Auto-updates are pulled from GitHub Releases via `electron-updater`. On launch (and every 6 hours) the app checks for a newer version and downloads it in the background.

When an update is downloaded you will see:

- A Windows notification ("Monitor Overlay update ready").
- A banner at the top of the Settings window with a **Restart and install** button.
- A new tray menu item *"Install update vX.Y.Z and restart"*.

Pick any of these to apply the update. As a fallback, fully quitting via the tray will also install the pending update on the way out.
