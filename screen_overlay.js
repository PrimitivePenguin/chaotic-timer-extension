// remove any existing overlay before starting fresh
var existing = document.getElementById('__chaosOverlay')
if (existing) existing.remove()

window.__overlayRunning = false

console.log('[screen_overlay] challenge:', window.__challenge)
console.log('[screen_overlay] fn:', window[window.__challenge])

if (!window.__overlayRunning) {
  window.__overlayRunning = true
  const fn = window[window.__challenge]
  if (typeof fn === 'function') fn()
  else console.error('[screen_overlay] function not found:', window.__challenge)
}

null