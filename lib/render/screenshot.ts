import { chromium } from 'playwright-core'

import { buildPreviewHtml } from '@/lib/preview/build-html'

export interface PageScreenshot {
  /** What the vision reviewer is looking at, e.g. "desktop hero". */
  label: string
  /** JPEG data URL. */
  dataUrl: string
}

/** Let React + Babel + Tailwind CDN + images settle before capturing. */
const SETTLE_MS = 5_000
const JPEG_QUALITY = 70

/**
 * Renders the generated page in headless Chrome (the user's installed
 * Chrome via playwright-core — no browser download) and captures the
 * viewports the vision reviewer judges: desktop hero, desktop mid-scroll,
 * mobile hero. Returns null when no browser is available — the pipeline
 * degrades to code-only review.
 */
export async function captureScreenshots(code: string): Promise<PageScreenshot[] | null> {
  const html = buildPreviewHtml(code)

  let browser
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true })
  } catch {
    try {
      browser = await chromium.launch({ headless: true })
    } catch (cause: unknown) {
      console.warn(
        '[render] no headless browser available — vision review skipped:',
        cause instanceof Error ? cause.message.split('\n')[0] : 'launch failed'
      )
      return null
    }
  }

  try {
    const shots: PageScreenshot[] = []

    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await desktop.setContent(html, { waitUntil: 'load', timeout: 20_000 })
    await desktop.waitForTimeout(SETTLE_MS)

    const capture = async (page: typeof desktop, label: string) => {
      const buffer = await page.screenshot({ type: 'jpeg', quality: JPEG_QUALITY })
      shots.push({ label, dataUrl: `data:image/jpeg;base64,${buffer.toString('base64')}` })
    }

    await capture(desktop, 'desktop hero (1440px, first viewport)')
    await desktop.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5))
    await desktop.waitForTimeout(800)
    await capture(desktop, 'desktop mid-page (scrolled)')
    await desktop.close()

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await mobile.setContent(html, { waitUntil: 'load', timeout: 20_000 })
    await mobile.waitForTimeout(SETTLE_MS)
    await capture(mobile, 'mobile hero (390px, first viewport)')
    await mobile.close()

    return shots
  } catch (cause: unknown) {
    console.warn(
      '[render] screenshot capture failed — vision review skipped:',
      cause instanceof Error ? cause.message.split('\n')[0] : 'capture failed'
    )
    return null
  } finally {
    await browser.close().catch(() => undefined)
  }
}
