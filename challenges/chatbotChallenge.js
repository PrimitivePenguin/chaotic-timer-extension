window.chatbotChallenge = function() {
  const EXT_BASE = 'moz-extension://a2f91e21-e4b7-4507-96fe-9bbe81a3b81f'

  // ---- DEFAULT BOX (underneath) ----
  // ---- DEFAULT BOX ----
const { box: defaultBox, overlay: defaultOverlay } = createBox({
  title: 'End your session?',
  body: 'You started this for a reason.',
  buttons: [
    {
      label: 'Keep Going',
      color: '#39d98a',
      textColor: '#000',
      onClick: (overlay) => { overlay.remove(); onFail() }
    },
    {
      label: 'End Session',
      color: '#ff3b3b',
      textColor: '#fff',
      onClick: (overlay) => { overlay.remove(); onSuccess() }
    },
  ]
})

// ---- SPEECH BUBBLE (positioned over End Session button) ----
const { box, overlay: bubbleOverlay } = createBox({
  title: '',
  body: 'Hi! Do you need help with something?',
  speechBubble: true,
  width: '320px',
  buttons: []
})

// position bubble at bottom of default box, no fullscreen overlay
bubbleOverlay.style.cssText = `
  position: fixed;
  inset: 0;
  z-index: 1000000;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 250px;
  left: 20%;
  overflow: visible;
`
box.style.pointerEvents = 'auto'

  // make sure speech bubble is on top
  bubbleOverlay.style.zIndex = '1000000'

  // ---- CONTENT AREA ----
  const content = document.createElement('div')
  content.style.cssText = `font-family: monospace; margin-top: 1rem;`
  box.appendChild(content)

  // ---- FAQ LIST ----
  const FAQ = [
    { q: 'What is this?', a: 'A productivity tool designed to keep you focused. You agreed to this.' },
    { q: "Why can't I leave?", a: "Because you set this up yourself. You knew what you were doing." },
    { q: 'How long is left?', a: "Check the timer. It's right there." },
    { q: 'Can I take a break?', a: "No. You didn't set a break. This is what you chose." },
    { q: 'This is unfair', a: "You built this. I just work here." },
    { q: 'How do I make you disappear', a: null },
    { q: 'What happens if I close the browser?', a: "The timer keeps running. We'll be here when you get back." },
    { q: 'Help me', a: "I am helping you. By not helping you." },
  ]

  const TRIGGER_WORDS = ['die', 'disappear', 'kill', 'gone', 'remove', 'delete', 'stop', 'away']

  function setBubble(text) {
    const p = box.querySelector('p')
    if (p) p.textContent = text
  }

  function btnStyle(bg, color) {
    return `
      width: 100%; padding: 0.4em 0.75em;
      background: ${bg}; color: ${color};
      border: none; border-radius: 6px;
      font-family: monospace; !important; font-size: 11px;
      font-weight: 700; cursor: pointer;
      margin-bottom: 4px;
    `
  }

  // ---- SCREENS ----
  function showAskYesNo() {
    setBubble('Hi! Do you need help with something?')
    content.innerHTML = ''

    const btnRow = document.createElement('div')
    btnRow.style.cssText = `display:flex; gap:0.5rem;`

    const yesBtn = document.createElement('button')
    yesBtn.textContent = 'Yes'
    yesBtn.style.cssText = btnStyle('#39d98a', '#000')
    yesBtn.addEventListener('click', showInput)

    const noBtn = document.createElement('button')
    noBtn.textContent = 'No'
    noBtn.style.cssText = btnStyle('#222', '#888')
    noBtn.addEventListener('click', showInput)

    btnRow.appendChild(yesBtn)
    btnRow.appendChild(noBtn)
    content.appendChild(btnRow)
  }

  function showInput() {
    setBubble('What do you need help with?')
    content.innerHTML = ''

    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'Type something...'
    input.style.cssText = `
      width: 100%; background: #1a1a1a; border: 1px solid #333;
      border-radius: 6px; color: #f0ece4; font-family: monospace;
      font-size: 11px; padding: 0.4em 0.6em; margin-bottom: 0.5rem;
      outline: none; box-sizing: border-box;
    `
    content.appendChild(input)

    const sendBtn = document.createElement('button')
    sendBtn.textContent = 'Send'
    sendBtn.style.cssText = btnStyle('#ff3b3b', '#fff')
    sendBtn.addEventListener('click', () => {
      const val = input.value.toLowerCase().trim()
      const hasTrigger = TRIGGER_WORDS.some(w => val.includes(w))
      if (hasTrigger) {
        showResponse('why do you want that?')
      } else if (val.length > 0) {
        showResponse("i don't know what you want to say")
      } else {
        showFAQList()
      }
    })

    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendBtn.click() })
    content.appendChild(sendBtn)

    const orLabel = document.createElement('div')
    orLabel.style.cssText = `color:#444; font-size:10px; text-align:center; margin:0.4rem 0;`
    orLabel.textContent = '— or pick a topic —'
    content.appendChild(orLabel)

    const faqBtn = document.createElement('button')
    faqBtn.textContent = 'Browse topics'
    faqBtn.style.cssText = btnStyle('#1a1a1a', '#666')
    faqBtn.addEventListener('click', showFAQList)
    content.appendChild(faqBtn)
  }

  function showResponse(text) {
    setBubble(text)
    content.innerHTML = ''

    const nextBtn = document.createElement('button')
    nextBtn.textContent = 'Next'
    nextBtn.style.cssText = btnStyle('#222', '#888')
    nextBtn.addEventListener('click', showFAQList)
    content.appendChild(nextBtn)
  }

  function showFAQList() {
    setBubble('What can I help you with?')
    content.innerHTML = ''

    const list = document.createElement('div')
    list.style.cssText = `
      display: flex; flex-direction: column; gap: 10px;
      max-height: 150px; overflow-y: auto;
    `

    FAQ.forEach(item => {
      const btn = document.createElement('button')
      btn.textContent = item.q
      btn.style.cssText = `
        width: 100%; padding: 0.45em 0.75em;
        background: #1a1a1a; border: 1px solid #2a2a2a;
        border-radius: 6px; color: #f0ece4; font-family: monospace;
        font-size: 11px; text-align: left; cursor: pointer;
      `
      btn.addEventListener('click', () => {
        if (item.a === null) {
          bubbleOverlay.remove()
          onSuccess()
        } else {
          showFAQAnswer(item.a)
        }
      })
      list.appendChild(btn)
    })

    content.appendChild(list)
  }

  function showFAQAnswer(answer) {
    setBubble(answer)
    content.innerHTML = ''

    const nextBtn = document.createElement('button')
    nextBtn.textContent = 'Next'
    nextBtn.style.cssText = btnStyle('#222', '#888')
    nextBtn.addEventListener('click', showAskYesNo)
    content.appendChild(nextBtn)
  }

  // ---- START ----
  showAskYesNo()
}

null