document.addEventListener('DOMContentLoaded', () => {
    /**
   * popup.js — POPUP UI SCRIPT
   * ----------------------------------------
   * Runs only inside the extension toolbar popup.
   * Responsible for:
   *   1. Displaying the countdown ring timer
   *   2. Handling Start Session / End Session button
   *   3. Writing session state to Firebase when timer starts or stops
   *
   * This file has NO site blocking logic.
   * It only manages the UI and writes to Firebase.
   * chaotic_clock.js handles the actual blocking.
   */

  const FIREBASE_URL = 'https://chaotic-timer-default-rtdb.firebaseio.com/session.json'
  const CIRCUMFERENCE = 2 * Math.PI * 58
  console.log('popup loaded')
  // Elements
  const ringFill = document.getElementById('ringFill')
  const ringTime = document.getElementById('ringTime')
  const ringLabel = document.getElementById('ringLabel')
  const statusDot = document.getElementById('statusDot')
  const statusText = document.getElementById('statusText')
  const mainBtn = document.getElementById('mainBtn')
  const inputMM = document.getElementById('inputMM')
  const inputSS = document.getElementById('inputSS')

  // State
  let totalSeconds = 0
  let remainingSeconds = 0
  let isActive = false
  let interval = null



  // ---- FIREBASE ----
  async function writeToFirebase(payload) {
    console.log('[popup] writing to Firebase:', payload)
    try {
      await fetch(FIREBASE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      console.log('[popup] Firebase updated successfully')
    } catch (err) {
      console.error('[popup] Firebase write failed:', err)
    }
  }

  // ---- TIMER LOGIC ----
  function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function setRingProgress(ratio) {
    const offset = CIRCUMFERENCE * (1 - ratio)
    ringFill.style.strokeDashoffset = offset.toString()
  }

  function updateUI() {
    if (isActive) {
      const ratio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0
      ringTime.textContent = formatTime(remainingSeconds)
      ringTime.className = 'ring-time active'
      ringFill.className = 'ring-fill'
      ringLabel.textContent = 'remaining'
      setRingProgress(ratio)
      statusDot.className = 'status-dot active'
      statusText.textContent = 'ACTIVE'
      mainBtn.textContent = 'End Session'
      mainBtn.className = 'main-btn end'
      inputMM.disabled = true
      inputSS.disabled = true
    } else {
      ringTime.textContent = '——'
      ringTime.className = 'ring-time idle'
      ringFill.className = 'ring-fill idle'
      ringLabel.textContent = 'set time'
      setRingProgress(0)
      statusDot.className = 'status-dot'
      statusText.textContent = 'IDLE'
      mainBtn.textContent = 'Start Session'
      mainBtn.className = 'main-btn start'
      inputMM.disabled = false
      inputSS.disabled = false
    }
  }

  function tick() {
    if (remainingSeconds <= 0) {
      stopTimer()
      return
    }
    remainingSeconds--
    updateUI()
  }

  function startTimer() {
    const mm = Math.max(0, parseInt(inputMM.value) || 0)
    const ss = Math.max(0, Math.min(59, parseInt(inputSS.value) || 0))
    totalSeconds = mm * 60 + ss
    if (totalSeconds <= 0) return

    remainingSeconds = totalSeconds
    isActive = true
    interval = setInterval(tick, 1000)
    updateUI()

    // Tell Firebase session is active — chaotic_clock.js will pick this up
    writeToFirebase({
      active: true,
      endsAt: Date.now() + totalSeconds * 1000,
      bannedSites: ['reddit.com', 'youtube.com', 'twitter.com', 'instagram.com'],
    })
  }

  function stopTimer() {
    isActive = false
    if (interval) { clearInterval(interval); interval = null }
    remainingSeconds = 0
    totalSeconds = 0
    updateUI()

    // Tell Firebase session is over — chaotic_clock.js will stop blocking
    writeToFirebase({
      active: false,
      endsAt: null,
      bannedSites: [],
    })
  }

  function handleBtn() {
    if (isActive) {
      stopTimer()
    } else {
      startTimer()
    }
  }

  // Expose to HTML onclick
  window.handleBtn = handleBtn
  mainBtn.addEventListener('click', handleBtn)

  // ---- INPUT FORMATTING ----
  inputMM.addEventListener('blur', () => {
    inputMM.value = (parseInt(inputMM.value) || 0).toString().padStart(2, '0')
  })

  inputSS.addEventListener('blur', () => {
    let val = parseInt(inputSS.value) || 0
    if (val > 59) val = 59
    inputSS.value = val.toString().padStart(2, '0')
  })

  // ---- INIT ----
  // On popup open, read Firebase to restore state if session is already running
  async function init() {
    try {
      const res = await fetch(FIREBASE_URL)
      const data = await res.json()
      if (data && data.active && data.endsAt) {
        const remaining = Math.max(0, Math.floor((data.endsAt - Date.now()) / 1000))
        if (remaining > 0) {
          totalSeconds = remaining
          remainingSeconds = remaining
          isActive = true
          interval = setInterval(tick, 1000)
        }
      }
    } catch (err) {
      console.warn('[popup] could not restore session state:', err)
    }
    updateUI()
  }

  init()
})
