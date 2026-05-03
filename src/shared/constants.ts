export const APP_NAME = 'Monitor Overlay'
export const APP_ID = 'com.janitorpuppo.monitor-overlay'

export const OUTLINE_THICKNESS_PX = 2

export const DEFAULT_OUTLINE_COLOR = '#00FFFF'

export const OBS_RESET_CSS = `
html, body {
  background-color: rgba(0, 0, 0, 0) !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}
body > img:only-child {
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: cover !important;
}
`

export const STRETCH_FIT_JS = `
;(function () {
  if (window.__monitorOverlayStretchInstalled) return
  window.__monitorOverlayStretchInstalled = true

  var SCALE_RE = /^\\s*scale\\(\\s*[\\d.]+\\s*\\)\\s*$/i
  var rafId = 0

  function fix(el) {
    var cs = getComputedStyle(el)
    var w = parseFloat(cs.width)
    var h = parseFloat(cs.height)
    if (!w || !h) return
    var sx = window.innerWidth / w
    var sy = window.innerHeight / h
    el.style.transformOrigin = 'top left'
    el.style.transform = 'scaleX(' + sx + ') scaleY(' + sy + ')'
    var p = el.parentElement
    if (p) {
      var pcs = getComputedStyle(p)
      if (pcs.display.indexOf('flex') !== -1) {
        p.style.setProperty('display', 'block', 'important')
      }
    }
  }

  function scan() {
    var els = document.querySelectorAll('*')
    for (var i = 0; i < els.length; i++) {
      var el = els[i]
      var t = el.style && el.style.transform
      if (t && SCALE_RE.test(t)) fix(el)
    }
  }

  function schedule() {
    if (rafId) return
    rafId = requestAnimationFrame(function () {
      rafId = 0
      scan()
    })
  }

  schedule()

  var obs = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var m = muts[i]
      if (m.type === 'attributes' && m.attributeName === 'style') {
        var t = m.target.style && m.target.style.transform
        if (t && SCALE_RE.test(t)) {
          schedule()
          break
        }
      } else if (m.type === 'childList' && m.addedNodes.length) {
        schedule()
        break
      }
    }
  })
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style'],
    subtree: true,
    childList: true
  })

  window.addEventListener('resize', schedule)
})()
`

export const STATE_UPDATE_CHANNEL = 'state:update'

export const HOTKEY_DEFAULTS = {
  toggleVisibility: 'Ctrl+Alt+O',
  reloadAll: 'Ctrl+Alt+R',
  openSettings: 'Ctrl+Alt+,',
  muteAllToggle: 'Ctrl+Alt+M'
} as const
