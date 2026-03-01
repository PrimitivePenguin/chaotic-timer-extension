window.alertChallenge = function() {
  const TOTAL_BOXES = 50
  const BOX_W = 400
  const BOX_H = 300
  const GAP = 10

  const allBoxOverlays = []
  let trapCount = 0
  const MAX_TRAPS = 3

  // ---- MAIN BOX ----
  const { overlay: mainOverlay } = createBox({
    title: 'End your session?',
    body: '',
    buttons: [
      {
        label: 'Keep Going',
        color: '#39d98a',
        textColor: '#000',
        onClick: (overlay) => { overlay.remove(); onFail(); clearAll() }
      },
      {
        label: 'End Session',
        color: '#ff3b3b',
        textColor: '#fff',
        onClick: (overlay) => { overlay.remove(); onSuccess(); clearAll() }
      },
    ]
  })

  function clearAll() {
    allBoxOverlays.forEach(o => o.remove())
    allBoxOverlays.length = 0
  }

  // ---- SPAWN PATTERN ----
  // Boxes spawn from top or left edge, march across screen,
  // then continue from another edge when hitting the boundary

  const positions = []

  function generatePositions() {
    const OFFSET_X = 30
    const OFFSET_Y = 40

    let x = GAP
    let y = GAP

    for (let i = 0; i < TOTAL_BOXES; i++) {
      positions.push({ x, y })

      x += OFFSET_X
      y += OFFSET_Y

      // hit right edge — reset to left, continue downward
      if (x + BOX_W > window.innerWidth - GAP) {
        x = GAP
      }

      // hit bottom edge — reset to top, continue rightward
      if (y + BOX_H > window.innerHeight - GAP) {
        y = GAP
      }
    }
  }

  generatePositions()
  generatePositions()

  // ---- SPAWN BOXES ----
  function spawnAlertBox(index) {
    const pos = positions[index] || {
      x: GAP + Math.random() * (window.innerWidth - BOX_W - GAP * 2),
      y: GAP + Math.random() * (window.innerHeight - BOX_H - GAP * 2)
    }

    // decide if this is a trap box
    // traps are always hidden among the middle boxes, never first 3 or last 3
    const canBeTrap = index > 3 && index < TOTAL_BOXES - 3 && trapCount < MAX_TRAPS
    const isTrap = canBeTrap && Math.random() < 0.15

    if (isTrap) {
      trapCount++
      // trap box: "continue session" is the main button, close is small and off to side
      const { overlay } = createBox({
        title: '⚠️ WARNING',
        body: 'NOT ENOUGH DETERMINATION',
        buttons: [
          {
            label: 'Continue Session',
            color: '#222',
            textColor: '#fff',
            onClick: () => {
              // this is the trap — clicking this restarts everything
              clearAll()
              trapCount = 0
              spawnAll()
            }
          },
          {
            label: 'close',
            color: '#1a1a1a',
            textColor: '#444',
            onClick: (overlay) => overlay.remove()
          },
        ],
        position: pos,
        width: `${BOX_W}px`,
      })
      allBoxOverlays.push(overlay)
    } else {
      // normal box: just a close button
      const { overlay } = createBox({
        title: '⚠️ WARNING',
        body: 'NOT ENOUGH DETERMINATION',
        buttons: [
          {
            label: 'Close',
            color: '#222',
            textColor: '#888',
            onClick: (overlay) => overlay.remove()
          },
        ],
        position: pos,
        width: `${BOX_W}px`,
      })
      allBoxOverlays.push(overlay)
    }
  }

  function spawnAll() {
    // stagger spawning so they don't all appear at once
    for (let i = 0; i < TOTAL_BOXES; i++) {
      setTimeout(() => spawnAlertBox(i), i * 80)
    }
  }

  spawnAll()
}

null