function createBox({ title, body, buttons = [], width = '360px' }) {
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.85);
    z-index: 999999; display: flex; align-items: center;
    justify-content: center; font-family: monospace;
  `

  const box = document.createElement('div')
  box.style.cssText = `
    background: #111; border: 1px solid #2a2a2a;
    border-radius: 12px; padding: 2rem;
    width: ${width}; text-align: center;
    box-shadow: 0 8px 48px rgba(0,0,0,0.8);
  `

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

  box.innerHTML = `
    <h2 style="color:#f0ece4; font-size:1.3rem; margin-bottom:0.5rem">${title}</h2>
    <p style="color:#666; font-size:12px; line-height:1.6">${body}</p>
  `
  box.appendChild(btnRow)
  overlay.appendChild(box)
  document.body.appendChild(overlay)

  return { overlay, box, remove: () => overlay.remove() }
}

// ---- CHALLENGES ----


function onSuccess() {
  window.__overlayRunning = false
  // tell background to actually end the session in Firebase
  browser.runtime.sendMessage({ type: 'CONFIRM_END_SESSION' })
}

function onFail() {
  window.__overlayRunning = false
  // do nothing — session keeps going
}