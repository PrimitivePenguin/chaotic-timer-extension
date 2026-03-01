const EXT_BASE = browser.runtime.getURL('')

window.holdChallenge = function() {
  const image = {
    ad1: `${EXT_BASE}images/18plus.jpg`,
    ad2: `${EXT_BASE}images/STONK.png`,
  }

  const adBoxes = []
  const spawnedPositions = [
    // reserve main box area
    {
      x: window.innerWidth / 2 - 180,
      y: window.innerHeight / 2 - 150,
      w: 360,
      h: 300
    }
  ]

  function getRandomPosition(width, height) {
    const maxAttempts = 20
    const padding = 20
    for (let i = 0; i < maxAttempts; i++) {
      const x = padding + Math.random() * (window.innerWidth - width - padding * 2)
      const y = padding + Math.random() * (window.innerHeight - height - padding * 2)
      const overlaps = spawnedPositions.some(b => {
        return !(x + width < b.x || x > b.x + b.w || y + height < b.y || y > b.y + b.h)
      })
      if (!overlaps) return { x, y }
    }
    // fallback
    return {
      x: padding + Math.random() * (window.innerWidth - width - padding * 2),
      y: padding + Math.random() * (window.innerHeight - height - padding * 2)
    }
  }

  function spawnAd({ title, body, img, button = [] }) {
    const adW = 300
    const adH = 280
    const pos = getRandomPosition(adW, adH)
    spawnedPositions.push({ x: pos.x, y: pos.y, w: adW, h: adH })
    const { overlay } = createBox({
      title,
      body,
      buttons: button,
      position: pos,
      width: `${adW}px`,
      image: img
    })
    adBoxes.push(overlay)
  }

  // ---- MAIN BOX ----
  const { box, overlay } = createBox({
    title: 'End Session?',
    body: 'Loading...',
    buttons: []
  })

  // progress bar
  const barWrap = document.createElement('div')
  barWrap.style.cssText = `background:#1a1a1a; border-radius:4px; height:8px; margin-bottom:0.5rem; overflow:hidden;`
  const bar = document.createElement('div')
  bar.style.cssText = `height:100%; width:0%; background:#ff3b3b;`
  barWrap.appendChild(bar)
  box.appendChild(barWrap)

  // progress label
  const label = document.createElement('div')
  label.style.cssText = `color:#444; font-size:11px; margin-bottom:1rem;`
  label.textContent = '0%'
  box.appendChild(label)

  // hold button
  const btn = document.createElement('button')
  btn.textContent = 'END SESSION'
  btn.style.cssText = `
    padding:0.8em 2em; background:#ff3b3b; color:#fff;
    border:none; border-radius:8px; font-family:monospace;
    font-size:13px; font-weight:700; cursor:pointer;
    margin-bottom:0.5rem; display:block; width:100%;
  `
  box.appendChild(btn)


  // ---- MILESTONES ----
  let speedMultiplier = 1
  let frozen = false

  const milestones = [
    {
      at: 25,
      triggered: false,
      action: () => spawnAd({
        title: 'SEXY SINGLES IN YOUR AREA',
        body: 'WHAT ARE YOU WAITING FOR!?',
        img: image.ad1,
        button: [
        {
          label: 'DETAILS',
          color: '#eee',
          textColor: '#888',
          onClick: () => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')
        }
      ]
      })
    },
    {
      at: 35,
      triggered: false,
      action: () => { speedMultiplier = 0.4 } 
    },
    {
      at: 50,
      triggered: false,
      action: () => spawnAd({
        title: 'MAKE $1,000,000 FROM HOME',
        body: 'JUST SHORT THE MARKET WITH THIS ONE SIMPLE TRICK!',
        img: image.ad2,
        button: [{
          label: 'DETAILS',
          color: '#eee',
          textColor: '#888',
          onClick: () => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')
        }]
      })
    },
    {
      at: 75,
      triggered: false,
      action: () => { speedMultiplier = 0.2 }
    },
    {
      at: 90,
      triggered: false,
      action: () => {
        frozen = true
        setTimeout(() => { frozen = false }, 2000)
      }
    },
  ]

  function clearAds() {
    adBoxes.forEach(ad => ad.remove())
    adBoxes.length = 0
    spawnedPositions.splice(1) // keep only main box reservation
  }

  function checkMilestones() {
    milestones.forEach(m => {
      if (!m.triggered && progress >= m.at) {
        m.triggered = true
        m.action()
      }
    })
  }

  // ---- HOLD LOGIC ----
  let progress = 0
  let ticker = null

btn.addEventListener('mousedown', () => {
  clearAds() // clear previous ads when starting a new hold
  ticker = setInterval(() => {
    if (frozen) return
    const chaos = Math.random() < 0.2 ? 0 : 1
    progress = Math.min(100, progress + 1.5 * speedMultiplier * chaos)
    bar.style.width = progress + '%'
    label.textContent = Math.floor(progress) + '%'
    checkMilestones()
    if (progress >= 100) {
      clearInterval(ticker)
      clearAds()
      overlay.remove()
      onSuccess()
    }
  }, 60)
})

const reset = () => {
  clearInterval(ticker)
  // removed clearAds() from here
  ticker = null
  progress = 0
  speedMultiplier = 1
  frozen = false
  bar.style.width = '0%'
  label.textContent = '0%'
  milestones.forEach(m => m.triggered = false)
}



  btn.addEventListener('mouseup', reset)
  btn.addEventListener('mouseleave', reset)
}

null