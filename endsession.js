var CHALLENGES = ['defaultChallenge'] // do whatever the function name is

function triggerChallenge() {
  const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const id = tabs[0].id
    browser.tabs.executeScript(id, { code: `window.__challenge = '${challenge}'` })
      .then(() => { console.log('[endsession] set var'); return browser.tabs.executeScript(id, { file: 'box.js' }) })
      .then(() => { console.log('[endsession] loaded box'); return browser.tabs.executeScript(id, { file: `challenges/${challenge}.js` }) })
      .then(() => { console.log('[endsession] loaded challenge'); return browser.tabs.executeScript(id, { file: 'screen_overlay.js' }) })
      .then(() => console.log('[endsession] loaded screen_overlay'))
      .catch(err => console.error('[endsession] error:', err.message, err))
  })
}