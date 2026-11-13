import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('Grok Bot 使用指南与实战教程')
})

test('filters articles when a category is selected', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('文章分类').getByRole('link', { name: '场景实战' }).click()

  await expect(page).toHaveURL(/\/category\/bot-practice\/$/)
  await expect(page.locator('h1')).toHaveText('场景实战：Grok Bot 使用指南')
  await expect(page.getByLabel('文章分类').getByRole('link', { name: '场景实战' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(page.locator('.article-card')).toHaveCount(1)
})

test('searches articles and shows an empty result', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('searchbox').fill('小红书')
  await expect(page.locator('.article-card')).toHaveCount(1)
  await expect(page.locator('.article-card')).toContainText('小红书内容自动化工作流')

  await page.getByRole('searchbox').fill('no-matching-article')
  await expect(page.locator('.article-card')).toHaveCount(0)
  await expect(page.locator('.empty-state')).toContainText('没有找到相关文章')
})

test('opens an article and preserves it after a reload', async ({ page }) => {
  await page.goto('/')
  const article = page.locator('.article-card').filter({ hasText: '小红书内容自动化工作流' })
  await article.getByRole('link').click()
  await expect(page).toHaveURL(/\/article\/grok-bot-xiaohongshu-content-automation-workflow\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('小红书内容自动化工作流')

  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('小红书内容自动化工作流')
  await expect(page.locator('.article-content')).toContainText('热点选题 Bot')
  await expect(page).toHaveTitle(/小红书内容自动化工作流/)
})

test('serves prerendered article content and consistent SEO URLs', async ({ request }) => {
  const response = await request.get('/article/grok-bot-xiaohongshu-content-automation-workflow/')
  expect(response.ok()).toBeTruthy()
  const html = await response.text()
  expect(html).toContain('用 Grok Bot 搭建小红书内容自动化工作流')
  expect(html).toContain('application/ld+json')

  const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)
  expect(canonical).not.toBeNull()
  const origin = new URL(canonical![1]!).origin
  expect(origin).toBe('https://grokbotai.fun')
  expect(html).toContain('<html lang="zh-CN">')
  expect(html).toContain(
    '"url":"https://grokbotai.fun/article/grok-bot-xiaohongshu-content-automation-workflow/"',
  )
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.ok()).toBeTruthy()
  expect(await sitemap.text()).toContain(
    `${origin}/article/grok-bot-xiaohongshu-content-automation-workflow/`,
  )
  const textSitemap = await request.get('/sitemap.txt')
  expect(textSitemap.ok()).toBeTruthy()
  expect(await textSitemap.text()).toContain(
    `${origin}/article/grok-bot-xiaohongshu-content-automation-workflow/`,
  )
  const robots = await request.get('/robots.txt')
  expect(robots.ok()).toBeTruthy()
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`)
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.txt`)
})

test('uses the production origin for home and category SEO', async ({ request }) => {
  for (const path of ['/', '/category/bot-practice/']) {
    const response = await request.get(path)
    expect(response.ok()).toBeTruthy()
    const html = await response.text()
    expect(html).toContain('<html lang="zh-CN">')
    expect(html).toContain(`<link rel="canonical" href="https://grokbotai.fun${path}">`)
    expect(html).not.toContain('grokbotai.vercel.app')
  }
})

test.describe('mobile layout', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('keeps navigation and article cards inside the viewport', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: '主导航' }).getByRole('link').first()).toHaveCSS(
      'min-height',
      '44px',
    )

    const layout = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      pageWidth: document.documentElement.scrollWidth,
    }))
    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewport)
    await expect(page.locator('.article-card').first()).toBeVisible()
  })

  test('stacks article content and keeps wide content scrollable', async ({ page }) => {
    await page.goto('/')
    await page.locator('.article-card').first().click()

    await expect(page.locator('.reading-layout')).toHaveCSS('display', 'block')
    await expect(page.locator('.table-of-contents')).toBeVisible()

    const layout = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      pageWidth: document.documentElement.scrollWidth,
    }))
    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewport)
  })
})
