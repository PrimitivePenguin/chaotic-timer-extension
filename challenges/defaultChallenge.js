window.defaultChallenge = function() {
  console.log('[defaultChallenge] triggered')
  createBox({
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
}

null