let sessionState = {
  active: false,
  endsAt: null,
  bannedSites: [],
}

async function getUid() {
  let { uid } = await browser.storage.local.get('uid')
  if (!uid) {
    uid = crypto.randomUUID()
    await browser.storage.local.set({ uid })
    console.log('[background] generated new uid:', uid)
  }
  return uid
}

async function getFirebaseUrl() {
  const uid = await getUid()
  return `https://chaotic-timer-default-rtdb.firebaseio.com/users/${uid}/session.json`
}

browser.runtime.onInstalled.addListener(async () => {
  await getUid()
})

// Refresh state from Firebase every 5 seconds
async function refreshState() {
  try {
    const url = await getFirebaseUrl()
    const res = await fetch(url)
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

// Single unified message listener
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_UID') {
    getUid().then(sendResponse)
    return true
  }

  if (msg.type === 'CONFIRM_END_SESSION') {
    console.log('[background] session ended by user')
    getFirebaseUrl().then(url => {
      fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false, endsAt: null })
      }).then(r => r.json()).then(data => console.log('[background] Firebase response:', data))
    })
  }

  if (msg.type === 'END_SESSION_CHAOS') {
    triggerChallenge()
  }
})