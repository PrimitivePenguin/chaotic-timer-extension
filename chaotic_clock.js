/**
 * chaotic_clock.js — CONTENT SCRIPT
 * ----------------------------------------
 * Injected into every webpage the user visits.
 * Responsible for:
 *   1. Polling Firebase every 3 seconds to get session state
 *   2. Checking if the current site is on the banned list
 *   3. Redirecting to the chaos page if banned during active session
 *
 * This file has NO UI. It runs silently in the background of every tab.
 */

const FIREBASE_URL = 'https://chaotic-timer-default-rtdb.firebaseio.com/session.json'
const CHAOS_PAGE = 'https://your-vercel-app.vercel.app/banned'

document.body.style.border = '3px solid red'

let sessionState = {
  active: false,
  endsAt: null,
  bannedSites: [],
}

// Get the current page's hostname e.g. "reddit.com"
function getCurrentHost() {
  return window.location.hostname.replace(/^www\./, '')
}

// Check if current site matches any banned site
function isBanned(host) {
  return sessionState.bannedSites.some(site => host.includes(site) || site.includes(host))
}

// Redirect to the chaos/banned page
function redirectToChaosPage() {
  const host = getCurrentHost()
  window.location.href = `${CHAOS_PAGE}?site=${host}`
}

// Fetch latest session state from Firebase
async function fetchSessionState() {
  try {
    const res = await fetch(FIREBASE_URL)
    const data = await res.json()
    if (data) {
      sessionState = data
    }
  } catch (err) {
    // Silently fail — don't block the user if Firebase is unreachable
    console.warn('[chaotic_clock] could not reach Firebase:', err)
  }
}

// Main check — runs every poll cycle
async function checkAndBlock() {
  await fetchSessionState()

  // If no active session, do nothing
  if (!sessionState.active) return

  // If session has expired, do nothing
  if (sessionState.endsAt && Date.now() > sessionState.endsAt) return

  // If current site is banned, redirect
  const host = getCurrentHost()
  if (isBanned(host)) {
    console.log(`[chaotic_clock] ${host} is banned. redirecting...`)
    redirectToChaosPage()
  }
}

// Run immediately on page load
checkAndBlock()

// Then poll every 3 seconds in case session starts while page is open
setInterval(checkAndBlock, 3000)