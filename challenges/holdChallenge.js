window.holdChallenge = function() {
    const adBoxes = [] // track all boxes to avoid overlap
  const { box, overlay } = createBox({
    title: 'End Session?',
    body: 'Loading...',
    buttons: []
  })

  // progress bar wrap
  const barWrap = document.createElement('div')
  barWrap.style.cssText = `
    background: #1a1a1a; border-radius: 4px;
    height: 8px; margin-bottom: 0.5rem; overflow: hidden;
  `
  const bar = document.createElement('div')
  bar.style.cssText = `
    height: 100%; width: 0%;
    background: #ff3b3b;
  `
  barWrap.appendChild(bar)
  box.appendChild(barWrap)

  // progress label
  const label = document.createElement('div')
  label.style.cssText = `color: #444; font-size: 11px; margin-bottom: 1rem;`
  label.textContent = '0%'
  box.appendChild(label)

  // hold button
  const btn = document.createElement('button')
  btn.textContent = 'END SESSION'
  btn.style.cssText = `
    padding: 0.8em 2em; background: #ff3b3b; color: #fff;
    border: none; border-radius: 8px; font-family: monospace;
    font-size: 13px; font-weight: 700; cursor: pointer;
    margin-bottom: 0.5rem; display: block; width: 100%;
  `
  box.appendChild(btn)

  // ---- MILESTONE LIST ----
  // each entry: { at: 0-100, triggered: false, action: fn }
  const milestones = [
    {
      at: 25,
      triggered: false,
      action: () => {
        console.log('[holdChallenge] milestone: 25% — ad')
        console.log('[holdChallenge] image url:', window.__images.ad1)
        const { box, overlay } = createBox({
            title: 'AD #1?',
            body: 'SEXY SINGLES IN YOUR AREA',
            buttons: [],
            position: { x: window.innerWidth - 220, y: 20 },
            width: '200px',
            images: window.__images.ad1
        })
        adBoxes.push(overlay)
      }
    },
    {
      at: 35,
      triggered: false,
      action: () => {
        console.log('[holdChallenge] milestone: 35% — speed up')
        speedMultiplier = 0.4 // speed up
      }
    },
    {
      at: 50,
      triggered: false,
      action: () => {console.log('[holdChallenge] milestone: 50% — ad')
        const { box, overlay } = createBox({
            title: 'AD #2?',
            body: 'LEARN HOW TO GET $1,000,000 FROM HOME',
            buttons: [],
            position: { x: window.innerWidth - 220, y: 20 },
            width: '200px',
            images: window.__images.ad2
        })
        adBoxes.push(overlay)
      }
    },
    {
      at: 75,
      triggered: false,
      action: () => {
        console.log('[holdChallenge] milestone: 75% — slowing down')
        speedMultiplier = 0.2 // slow to a crawl at 75%
      }
    },
    {
      at: 90,
      triggered: false,
      action: () => {
        console.log('[holdChallenge] milestone: 90% — stuck!')
        frozen = true
        setTimeout(() => {
          frozen = false
          console.log('[holdChallenge] unstuck')
        }, 2000) // freeze for 2 seconds
      }
    },
  ]

  function clearAds() {
    adBoxes.forEach(ad => ad.remove())
    adBoxes.length = 0
  }

  // ---- HOLD LOGIC ----
  let progress = 0
  let ticker = null
  let speedMultiplier = 1
  let frozen = false

  function checkMilestones() {
    milestones.forEach(m => {
      if (!m.triggered && progress >= m.at) {
        m.triggered = true
        m.action()
      }
    })
  }

  btn.addEventListener('mousedown', () => {
    ticker = setInterval(() => {
      if (frozen) return // completely stuck

      // base speed is 1.5 per tick, modified by speedMultiplier
      // randomly slow down occasionally for extra chaos
      const chaos = Math.random() < 0.2 ? 0 : 1 // 20% chance of no progress
      progress = Math.min(100, progress + 1.5 * speedMultiplier * chaos)

      bar.style.width = progress + '%'
      label.textContent = Math.floor(progress) + '%'
      checkMilestones()

      if (progress >= 100) {
        clearInterval(ticker)
        overlay.remove()
        clearAds()
        onSuccess()
      }
    }, 60)
  })

  const reset = () => {
    clearInterval(ticker)
    clearAds()
    ticker = null
    progress = 0
    speedMultiplier = 1
    frozen = false
    bar.style.width = '0%'
    label.textContent = '0%'
    // reset milestones so they trigger again next hold
    milestones.forEach(m => m.triggered = false)
  }

  btn.addEventListener('mouseup', reset)
  btn.addEventListener('mouseleave', reset)
}

null