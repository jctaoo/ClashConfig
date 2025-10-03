import { env } from 'cloudflare:workers'
import { Hono } from 'hono'

const app = new Hono()

/**
 * strictly check userAgent is clash
 * - DEMO: stash on iOS: Stash/3.1.1 Clash/1.9.0
 * - DEMO: clash verge rev on Windows: clash-verge/v2.4.2
 * - DEMO: ClashX.meta on Mac: ClashX Meta/v1.4.24 (com.metacubex.ClashX.meta; build:622; macOS 26.0.0) Alamofire/5.10.2
 * @param userAgent 
 * @returns 
 */
function checkUserAgent(userAgent: string) {
  if (!userAgent) {
    return false
  }

  // check stash
  if (userAgent.toLocaleLowerCase().startsWith('stash/')) {
    return true
  }

  // check clash verge rev
  if (userAgent.toLocaleLowerCase().startsWith('clash-verge/')) {
    return true
  }

  // check clashx.meta
  if (userAgent.toLocaleLowerCase().startsWith('clashx.meta/')) {
    return true
  }

  return false
}

/**
 * get sub content from subUrl
 * @param subUrl 
 * @param userAgent 
 */
async function getSubContent(subUrl: string, userAgent: string) {
  const controller = new AbortController()
  const t = setTimeout(() => {
    controller.abort()
  }, 10000) // 10 seconds

  try {
    const response = await fetch(subUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": userAgent
      },
      signal: controller.signal
    })
    return await response.text()
  } finally {
    clearTimeout(t)
  }
}

app.get('/sub', async (c) => {
  const userAgent = c.req.header('User-Agent')
  const subEncoded = c.req.query('sub')

  if (userAgent && !checkUserAgent(userAgent)) {
    c.status(400)
    return c.text('Not supported, must request inside clash app')
  }

  if (!subEncoded) {
    c.status(400)
    return c.text('sub is required')
  }

  const subUrl = atob(subEncoded)

  try {
    const content = await getSubContent(subUrl, userAgent!)
    return c.text(content)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      const msg = `Upstream error: ${error.message}`
      return c.text(msg, 502)
    }
    c.status(500)
    return c.text('Internal server error')
  }
})

app.get("/health", (c) => {
  return c.text("OK")
})

export default app
