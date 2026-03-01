function createBox({ title, body, buttons = [], width = '360px', position = null, id = null, image = null, speechBubble = false }) {

  const overlay = document.createElement('div')

  if (position) {
    overlay.style.cssText = `
      position: fixed;
      left: ${position.x}px;
      top: ${position.y}px;
      z-index: 999999;
    `
  } else {
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.85);
      z-index: 999999; display: flex; align-items: center;
      justify-content: center; font-family: monospace;
    `
  }

  if (id) overlay.id = id

  const box = document.createElement('div')

  if (speechBubble) {
    box.style.cssText = `
      background: #1a1a1a;
      border: 2px solid #444;
      border-radius: 50% / 35%;
      padding: 3rem 4rem;
      width: ${width};
      text-align: center;
      box-shadow: 0 8px 48px rgba(0,0,0,0.8);
      position: relative;
    `
    overlay.style.paddingBottom = '70px'
  } else {
    box.style.cssText = `
      background: #111; border: 1px solid #2a2a2a;
      border-radius: 12px; padding: 2rem;
      width: ${width}; text-align: center;
      box-shadow: 0 8px 48px rgba(0,0,0,0.8);
      position: relative;
    `
  }

  const btnRow = document.createElement('div')
  btnRow.style.cssText = `
    display: flex; gap: 0.5rem; margin-top: 1.5rem;
    justify-content: center; flex-wrap: wrap;
  `

  buttons.forEach(({ label, color = '#333', textColor = '#fff', onClick }) => {
    const btn = document.createElement('button')
    btn.textContent = label
    btn.style.cssText = `
      padding: 0.6em 1.4em; background: ${color};
      color: ${textColor}; border: none; border-radius: 8px;
      font-family: monospace; font-size: 13px;
      font-weight: 700; cursor: pointer;
    `
    btn.addEventListener('click', () => onClick(overlay))
    btnRow.appendChild(btn)
  })

  const imgHTML = image ? `
    <img src="${image}" style="width:100%; border-radius:8px; margin-bottom:1rem; display:block; object-fit:cover; max-height:160px;"/>
  ` : ''

  // set innerHTML first (title, body, image)
  box.innerHTML = `
    ${imgHTML}
    <h2 style="color:#f0ece4; font-size:1.3rem; margin-bottom:0.5rem">${title}</h2>
    <p style="color:#666; font-size:12px; line-height:1.6">${body}</p>
  `

  // append btnRow AFTER innerHTML so it isn't wiped
  box.appendChild(btnRow)

  // append tail and avatar AFTER innerHTML for same reason
  if (speechBubble) {
    const tail = document.createElement('div')
    tail.style.cssText = `
      position: absolute;
      bottom: -28px;
      left: 70px;
      width: 0; height: 0;
      border-top: 29px solid #444;
      border-right: 19px solid transparent;
    `
    const tailInner = document.createElement('div')
    tailInner.style.cssText = `
      position: absolute;
      top: -29px; left: 1px;
      width: 0; height: 0;
      border-top: 27px solid #1a1a1a;
      border-right: 17px solid transparent;
    `

    tail.appendChild(tailInner)
    box.appendChild(tail)

    const avatarEl = document.createElement('img')
    avatarEl.src = 'moz-extension://a2f91e21-e4b7-4507-96fe-9bbe81a3b81f/images/clock.png'
    avatarEl.style.cssText = `
      position: absolute;
      bottom: -80px;
      left: 40px;
      width: 60px; height: 60px;
      border-radius: 50%;
      border: 2px solid #444;
      background: #111;
      z-index: 2;
    `
    box.appendChild(avatarEl)
  }

  overlay.appendChild(box)
  document.body.appendChild(overlay)

  return { overlay, box, remove: () => overlay.remove() }
}

function onSuccess() {
  window.__overlayRunning = false
  browser.runtime.sendMessage({ type: 'CONFIRM_END_SESSION' })
}

function onFail() {
  window.__overlayRunning = false
}