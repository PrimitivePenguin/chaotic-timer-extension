window.swipeChallenge = function() {
    const { box, overlay: mainOverlay } = createBox({
        title: 'End your session?',
        body: 'Swipe to find the right button.',
        buttons: []
    })

  const TOTAL_BUTTONS = 20
  const REAL_INDEX = 2 + Math.floor(Math.random() * (TOTAL_BUTTONS - 4))

  // ---- SWIPE CONTAINER ----
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    overflow: hidden;
    width: 100%;
    margin-top: 1.5rem;
    position: relative;
    cursor: grab;
  `

  const track = document.createElement('div')
  track.style.cssText = `
    display: flex;
    gap: 8px;
    width: max-content;
    user-select: none;
  `

  for (let i = 0; i < TOTAL_BUTTONS; i++) {
    const isReal = i === REAL_INDEX
    const btn = document.createElement('button')
    btn.textContent = isReal ? 'End Session' : 'Keep Going'
    btn.style.cssText = `
      padding: 0.6em 1.2em;
      background: #39d98a;
      color: #000;
      border: none;
      border-radius: 8px;
      font-family: monospace;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      pointer-events: auto;
    `
    btn.dataset.real = isReal ? 'true' : 'false'
    track.appendChild(btn)
  }

  wrapper.appendChild(track)
  box.appendChild(wrapper)

  // ---- PHYSICS STATE ----
  let isDragging = false
  let currentOffset = 0
  let velocity = 0
  let lastX = 0
  let lastTime = 0
  let animFrame = null
  let dragDistance = 0

  function clampOffset(offset) {
    const maxScroll = -(track.scrollWidth - wrapper.offsetWidth)
    return Math.min(0, Math.max(offset, maxScroll))
  }

  function applyOffset(offset) {
    currentOffset = clampOffset(offset)
    track.style.transform = `translateX(${currentOffset}px)`
  }

  function momentum() {
    if (Math.abs(velocity) < 0.5) {
      cancelAnimationFrame(animFrame)
      return
    }
    velocity *= 0.92
    applyOffset(currentOffset + velocity)
    animFrame = requestAnimationFrame(momentum)
  }

  // ---- MOUSE EVENTS ----
  wrapper.addEventListener('mousedown', (e) => {
    isDragging = true
    dragDistance = 0
    lastX = e.clientX
    lastTime = Date.now()
    velocity = 0
    cancelAnimationFrame(animFrame)
    wrapper.style.cursor = 'grabbing'
    e.preventDefault()
  })

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    const dx = e.clientX - lastX
    const now = Date.now()
    const dt = now - lastTime || 1

    dragDistance += Math.abs(dx)
    velocity = dx / dt * 16
    applyOffset(currentOffset + dx)

    lastX = e.clientX
    lastTime = now
  })

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return
    isDragging = false
    wrapper.style.cursor = 'grab'

    if (dragDistance < 5) {
      const target = e.target.closest('button')
      if (target) {
        const isReal = target.dataset.real === 'true'
        mainOverlay.remove()  // ← use direct reference
        if (isReal) onSuccess()
        else onFail()
      }
    } else {
      animFrame = requestAnimationFrame(momentum)
    }
  })

  // ---- TOUCH EVENTS ----
  wrapper.addEventListener('touchstart', (e) => {
    dragDistance = 0
    lastX = e.touches[0].clientX
    lastTime = Date.now()
    velocity = 0
    cancelAnimationFrame(animFrame)
  }, { passive: true })

  wrapper.addEventListener('touchmove', (e) => {
    const dx = e.touches[0].clientX - lastX
    const now = Date.now()
    const dt = now - lastTime || 1

    dragDistance += Math.abs(dx)
    velocity = dx / dt * 16
    applyOffset(currentOffset + dx)

    lastX = e.touches[0].clientX
    lastTime = now
  }, { passive: true })

  wrapper.addEventListener('touchend', (e) => {
    if (dragDistance < 5) {
      const target = e.target.closest('button')
      if (target) {
        const isReal = target.dataset.real === 'true'
        const overlay = document.getElementById('__chaosOverlay')
        if (overlay) overlay.remove()
        if (isReal) onSuccess()
        else onFail()
      }
    } else {
      animFrame = requestAnimationFrame(momentum)
    }
  })
}

null