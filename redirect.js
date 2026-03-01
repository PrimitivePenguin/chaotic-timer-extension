function rickroll() {
  return { redirectUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&ref=chaotic' }
}

function cornfield() {
  return { redirectUrl: 'https://www.google.com/maps/@41.9758446,-93.6128573,955m/data=!3m1!1e3' }
}

function wikipedia() {
  return { redirectUrl: 'https://en.wikipedia.org/wiki/Special:Random' }
}

function nyan() {
  return { redirectUrl: 'https://www.nyan.cat' }
}

function skeleton() {
    // play gif of skeleton banging shield
    
}

// Array of all redirect functions
const REDIRECTS = [rickroll, cornfield, wikipedia, nyan]

// Pick a random one and execute it
function randomRedirect() {
  const fn = REDIRECTS[Math.floor(Math.random() * REDIRECTS.length)]
  return fn()
}
