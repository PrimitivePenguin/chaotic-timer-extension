window.smallChallenge = function() {
  createBox({
    title: 'End your session?',
    body: 'You started this for a reason.',
    buttons: [
      {
        label: ' ',
        color: '#39d98a',
        textColor: '#39d98a',
        onClick: (overlay) => { overlay.remove(); onFail() }
      },
      {
        label: ' ',
        color: '#ff3b3b',
        textColor: '#ff3b3b',
        onClick: (overlay) => { overlay.remove(); onSuccess() }
      },
    ]
  })

  // make buttons tiny after render
  setTimeout(() => {
    const btns = document.querySelectorAll('[style*="cursor: pointer"]')
    btns.forEach(btn => {
      btn.style.padding = '4px'
      btn.style.width = '10px'
      btn.style.height = '10px'
      btn.style.minWidth = '0'
      btn.style.fontSize = '0px'
      btn.style.borderRadius = '2px'
    })
  }, 0)
}

null