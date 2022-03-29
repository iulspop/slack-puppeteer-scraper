const { extractThreadHTML } = require('./extractThreadHTML')

async function extractPostsHTML(page, postsSelector, skipConversations) {
  const postsHTML = []

  // Starts at index 1 to skip first child element div.p-degraded_list__loading
  const postHandles = await page.$$(postsSelector)
  for (let i = 1; i < postHandles.length; i++) {
    const postHandle = postHandles[i]

    if (await postHandle.evaluate(post => post.isScraped)) continue

    try {
      const repliesButton = await postHandle.$('.c-message__reply_count')
      if (repliesButton && !skipConversations) {
        const threadHTML = await extractThreadHTML(repliesButton, page)
        postsHTML.push(threadHTML)
      } else {
        const postHTML = await postHandle.evaluate(post => post.outerHTML)
        postsHTML.push(postHTML)
      }
    } catch (error) {
      console.error(`Error scraping post. Skipping this post. Index: ${i}. Error: ${error.message}.`)
      continue
    }

    await postHandle.evaluate(post => (post.isScraped = true))
  }

  return postsHTML
}

exports.extractPostsHTML = extractPostsHTML
