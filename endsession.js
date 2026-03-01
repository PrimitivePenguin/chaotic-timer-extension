const CHALLENGES = ['default']

function triggerChallenge() {
  const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.executeScript(tabs[0].id, {
      code: `window.__challenge = '${challenge}'`
    }).then(() => {
      browser.tabs.executeScript(tabs[0].id, { file: 'screen_overlay.js' })
    })
  })
}

function randomEndSession() {
  triggerChallenge()
}