var CHALLENGES = ['alertChallenge'] // do whatever the function name is ['defaultChallenge', 'holdChallenge', 'alertChallenge', 'smallChallenge', 'goneChallenge']

function triggerChallenge() {
  const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const id = tabs[0].id
    // pre-resolve image URLs in background context where it works
    const images = {}
    if (challenge === 'holdChallenge') {
      const images = {
         ad1: browser.runtime.getURL('images/18plus.jpg'),
         ad2: browser.runtime.getURL('images/STONK.png'),
      }
      console.log('[endsession] pre-resolved images:', images)
    }
    
    
    browser.tabs.executeScript(id, { code: `window.__challenge = '${challenge}'; window.__images = JSON.parse('${JSON.stringify(images).replace(/'/g, "\\'")}');` })
      .then(() => console.log(`[endsession] set challenge to ${challenge} with images:`, images))
      .then(() => browser.tabs.executeScript(id, { file: 'box.js' }))
      .then(() => browser.tabs.executeScript(id, { file: `challenges/${challenge}.js` }))
      .then(() => browser.tabs.executeScript(id, { 
        code: `
          window.__challenge = '${challenge}';
          window.__images = {
            ad1: '${images.ad1 || ''}',
            ad2: '${images.ad2 || ''}'
          };
        `
      }))
      .then(() => browser.tabs.executeScript(id, { file: 'screen_overlay.js' }))
      .catch(err => console.error('[endsession] error:', err.message))
  })
}