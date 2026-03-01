var CHALLENGES = ['holdChallenge'] // do whatever the function name is ['defaultChallenge', 'holdChallenge']

function triggerChallenge() {
  const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const id = tabs[0].id
    // pre-resolve image URLs in background context where it works
    const images = {}
    if (challenge === 'holdChallenge') {
      const images = {
         ad1: browser.runtime.getURL('./images/18plus.png'),
         ad2: browser.runtime.getURL('./images/STONK.png'),
      }
      console.log('[endsession] pre-resolved images:', images)
    }
    
    browser.tabs.executeScript(id, { code: `window.__challenge = '${challenge}'; window.__images = ${JSON.stringify(images)}` })
      .then(() => browser.tabs.executeScript(id, { file: 'box.js' }))
      .then(() => browser.tabs.executeScript(id, { file: `challenges/${challenge}.js` }))
      .then(() => browser.tabs.executeScript(id, { file: 'screen_overlay.js' }))
      .catch(err => console.error('[endsession] error:', err.message))
  })
}