window.chatbotChallenge = function() {
  const EXT_BASE = browser.runtime.getURL('')

  // ---- DEFAULT BOX (underneath) ----
  const { overlay: defaultOverlay } = createBox({
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

  // ---- SHADOW DOM HOST ----
  const shadowHost = document.createElement('div')
    shadowHost.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -20%);
    z-index: 1000000;
    width: 340px;
    `
  document.body.appendChild(shadowHost)
  const shadow = shadowHost.attachShadow({ mode: 'open' })

  // ---- STYLES INSIDE SHADOW DOM ----
  const style = document.createElement('style')
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .bubble {
      background: #1a1a1a;
      border: 2px solid #444;
      border-radius: 40px;
      padding: 1.5rem 2rem;
      text-align: center;
      box-shadow: 0 8px 48px rgba(0,0,0,0.8);
      position: relative;
      color: #f0ece4;
      font-family: monospace;
      font-size: 12px;
    }
    .bubble-text {
      color: #f0ece4;
      font-size: 12px;
      line-height: 1.6;
      margin-bottom: 0.75rem;
      font-family: monospace;
    }
    .content { margin-top: 0.5rem; }
    button {
      display: block;
      width: 100%;
      padding: 0.4em 0.75em;
      border: none;
      border-radius: 6px;
      font-family: monospace;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      margin-bottom: 4px;
      color: inherit;
    }
    .btn-green { background: #39d98a; color: #000; }
    .btn-dark { background: #222; color: #888; }
    .btn-red { background: #ff3b3b; color: #fff; }
    .btn-faq {
      background: #111;
      border: 1px solid #2a2a2a;
      color: #f0ece4;
      text-align: left;
      margin-bottom: 5px;
      border-radius: 6px;
      padding: 0.45em 0.75em;
      width: 100%;
      display: block;
      font-family: monospace;
      font-size: 11px;
      cursor: pointer;
    }
    .btn-row { display: flex; gap: 0.5rem; }
    .btn-row button { flex: 1; }
    .list {
      display: flex; flex-direction: column;
      max-height: 150px; overflow-y: auto;
    }
    input {
      display: block;
      width: 100%;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 6px;
      color: #f0ece4;
      font-family: monospace;
      font-size: 11px;
      padding: 0.4em 0.6em;
      margin-bottom: 0.5rem;
      outline: none;
    }
    .or-label {
      color: #444;
      font-size: 10px;
      text-align: center;
      margin: 0.4rem 0;
      font-family: monospace;
    }
    .tail {
      position: absolute;
      bottom: -29px; left: 70px;
      width: 0; height: 0;
      border-top: 29px solid #444;
      border-right: 19px solid transparent;
    }
    .tail-inner {
      position: absolute;
      top: -29px; left: 1px;
      width: 0; height: 0;
      border-top: 27px solid #1a1a1a;
      border-right: 17px solid transparent;
    }
    .avatar {
      position: absolute;
      bottom: -62px; left: 28px;
      width: 44px; height: 44px;
      border-radius: 50%;
      border: 2px solid #444;
      background: #111;
    }
  `
  shadow.appendChild(style)

  // ---- BUBBLE BOX ----
  const bubble = document.createElement('div')
  bubble.className = 'bubble'

  const bubbleText = document.createElement('p')
  bubbleText.className = 'bubble-text'
  bubbleText.textContent = 'Hi! Do you need help with something?'
  bubble.appendChild(bubbleText)

  const content = document.createElement('div')
  content.className = 'content'
  bubble.appendChild(content)

  // tail
  const tail = document.createElement('div')
  tail.className = 'tail'
  const tailInner = document.createElement('div')
  tailInner.className = 'tail-inner'
  tail.appendChild(tailInner)
  bubble.appendChild(tail)

  // avatar
  const avatar = document.createElement('img')
  avatar.src = `${EXT_BASE}/images/clock.png`
  avatar.className = 'avatar'
  bubble.appendChild(avatar)

  shadow.appendChild(bubble)

  // ---- FAQ ----
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

  function setBubble(text) { bubbleText.textContent = text }

  function showAskYesNo() {
    setBubble('Hi! Do you need help with something?')
    content.innerHTML = ''
    const row = document.createElement('div')
    row.className = 'btn-row'
    const yes = document.createElement('button')
    yes.textContent = 'Yes'
    yes.className = 'btn-green'
    yes.addEventListener('click', showInput)
    const no = document.createElement('button')
    no.textContent = 'No'
    no.className = 'btn-dark'
    no.addEventListener('click', showInput)
    row.appendChild(yes)
    row.appendChild(no)
    content.appendChild(row)
  }

  function showInput() {
    setBubble('What do you need help with?')
    content.innerHTML = ''

    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'Type something...'
    content.appendChild(input)

    const send = document.createElement('button')
    send.textContent = 'Send'
    send.className = 'btn-red'
    send.addEventListener('click', () => {
      const val = input.value.toLowerCase().trim()
      const hasTrigger = TRIGGER_WORDS.some(w => val.includes(w))
      if (hasTrigger) showResponse('why do you want that?')
      else if (val.length > 0) showResponse("i don't know what you want to say")
      else showFAQList()
    })
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send.click() })
    content.appendChild(send)

    const or = document.createElement('div')
    or.className = 'or-label'
    or.textContent = '— or pick a topic —'
    content.appendChild(or)

    const browse = document.createElement('button')
    browse.textContent = 'Browse topics'
    browse.className = 'btn-dark'
    browse.addEventListener('click', showFAQList)
    content.appendChild(browse)
  }

  function showResponse(text) {
    setBubble(text)
    content.innerHTML = ''
    const next = document.createElement('button')
    next.textContent = 'Next'
    next.className = 'btn-dark'
    next.addEventListener('click', showFAQList)
    content.appendChild(next)
  }

  function showFAQList() {
    setBubble('What can I help you with?')
    content.innerHTML = ''
    const list = document.createElement('div')
    list.className = 'list'
    FAQ.forEach(item => {
      const btn = document.createElement('button')
      btn.textContent = item.q
      btn.className = 'btn-faq'
      btn.addEventListener('click', () => {
        if (item.a === null) {
          // play yoda death sound
            const audio = new Audio()
            audio.src = `${EXT_BASE}/sounds/yoda.mp3`
            audio.type = 'audio/mpeg'
            audio.addEventListener('error', (e) => console.log('[audio] error:', e, audio.error))
            audio.play()
          shadowHost.remove()
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
    const next = document.createElement('button')
    next.textContent = 'Next'
    next.className = 'btn-dark'
    next.addEventListener('click', showAskYesNo)
    content.appendChild(next)
  }

  showAskYesNo()
}

null