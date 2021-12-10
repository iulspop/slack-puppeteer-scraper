require('dotenv').config()

const puppeteer = require('puppeteer')
const ensureLogin = require('./utils/ensure-login')
const gotoChannel = require('./utils/goto-channel')
const capturePosts = require('./utils/capture-posts')
const saveData = require('./utils/save-data')
const scrollUp = require('./utils/scroll-up')
const isScrolledToTop = require('./utils/is-scrolled-to-top')

;(async () => {
  const startTime = new Date()

  const options = {
    headless: true,
    defaultViewport: { height: 8000, width: 1463 },
  }
  const browser = await puppeteer.launch(options)
  const page = await browser.newPage()
  await ensureLogin(page)

  await page.goto(process.env.SLACK_WORKSPACE_URL)
  await gotoChannel(page, 'the-spot')
  await page.waitForTimeout(10000)

  const channelFeedName = 'the-spot (channel)'
  const channelFeedID = `[aria-label="${channelFeedName}"]`
  const channelFeedHandle = await page.$(channelFeedID)

  do {
    const postHandles = await page.$$(`${channelFeedID} > div`)
    const postsHTML = await capturePosts(page, postHandles)
    saveData(postsHTML)
    await scrollUp(page, channelFeedID)
  } while (!(await isScrolledToTop(channelFeedHandle)))

  await page.screenshot({ path: './screenshot.png' })
  await browser.close()

  const endTime = new Date()
  const duration = (endTime - startTime) / 1000
  console.log(`The operation took ${duration} seconds`)
})()
