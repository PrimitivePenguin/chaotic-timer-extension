const FIREBASE_URL = 'https://chaotic-timer-default-rtdb.firebaseio.com/session.json'
const CHAOS_PAGE = 'https://your-vercel-app.vercel.app/banned'

let sessionState = {
  active: false,
  endsAt: null,
  bannedSites: [],
}

// Refresh state from Firebase every 5 seconds
async function refreshState() {
  try {
    const res = await fetch(FIREBASE_URL)
    const data = await res.json()
    if (data) sessionState = data
  } catch (err) {
    console.warn('[background] firebase fetch failed:', err)
  }
}

refreshState()
setInterval(refreshState, 5000)


// Intercept every navigation before it happens
browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Only block main page navigations, not images/css/api calls
    if (details.type !== 'main_frame') return {}

    if (!sessionState.active) return {}
    if (sessionState.endsAt && Date.now() > sessionState.endsAt) return {}

    const url = new URL(details.url)
    const host = url.hostname.replace(/^www\./, '')
    const isBanned = sessionState.bannedSites.some(
      site => host.includes(site) || site.includes(host)
    )

    if (isBanned) {
      console.log(`[background] blocking ${host}`)
      return randomRedirect()
    }

    return {}
  },
  { urls: ['<all_urls>'], types: ['main_frame'] },
  ['blocking']  
)


browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'CONFIRM_END_SESSION') {
    console.log('[background] session ended by user')
    fetch('https://chaotic-timer-default-rtdb.firebaseio.com/session.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false, endsAt: null, bannedSites: [] })
    })
  }
  if (msg.type === 'END_SESSION_CHAOS') {
    triggerChallenge()
  }
})