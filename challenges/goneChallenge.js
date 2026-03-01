window.goneChallenge = function() {
  const { overlay: mainOverlay } = createBox({
    title: 'End your session?',
    body: 'You started this for a reason.',
    buttons: [
      {
        label: 'Keep Going',
        color: '#39d98a',
        textColor: '#000',
        onClick: (overlay) => { overlay.remove(); endBtn.remove(); onFail() }
      },
    ]
  })

  // place end session button somewhere random on screen
  const endBtn = document.createElement('button')
  endBtn.textContent = 'End Session'
  endBtn.style.cssText = `
    position: fixed;
    left: ${20 + Math.random() * (window.innerWidth - 200)}px;
    top: ${20 + Math.random() * (window.innerHeight - 60)}px;
    padding: 0.6em 1.4em;
    background: #ff3b3b;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-family: monospace;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    z-index: 9999999;
    opacity: 0.02;
    transition: none;
  `
  document.body.appendChild(endBtn)

  endBtn.addEventListener('click', () => {
    mainOverlay.remove()
    endBtn.remove()
    onSuccess()
  })

  // gradually increase opacity to max 0.9 over 15 seconds
  let opacity = 0.02
  const maxOpacity = 0.3
  const duration = 50000
  const interval = 150
  const step = (maxOpacity - opacity) / (duration / interval)

  const fade = setInterval(() => {
    opacity = Math.min(maxOpacity, opacity + step)
    endBtn.style.opacity = opacity
    if (opacity >= maxOpacity) clearInterval(fade)
  }, interval)
}

null