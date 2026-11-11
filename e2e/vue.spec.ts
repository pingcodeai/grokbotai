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
  await expect(page.locator('.article-card')).toHaveCount(2)
})

test('searches articles and shows an empty result', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('searchbox').fill('Pages')
  await expect(page.locator('.article-card')).toHaveCount(1)
  await expect(page.locator('.article-card')).toContainText('Grok Bot Pages')

  await page.getByRole('searchbox').fill('no-matching-article')
  await expect(page.locator('.article-card')).toHaveCount(0)
  await expect(page.locator('.empty-state')).toContainText('没有找到相关文章')
})

test('opens an article and preserves it after a reload', async ({ page }) => {
  await page.goto('/')
  const article = page.locator('.article-card').filter({ hasText: 'Grok Bot Pages' })
  await article.getByRole('link').click()
  await expect(page).toHaveURL(/\/article\/grok-bot-pages-living-work-docs\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Grok Bot Pages')

  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Grok Bot Pages')
  await expect(page.locator('.article-content')).toContainText('Page')
  await expect(page).toHaveTitle(/Grok Bot Pages/)
})

test('serves prerendered article content and consistent SEO URLs', async ({ request }) => {
  const response = await request.get('/article/grok-bot-pages-living-work-docs/')
  expect(response.ok()).toBeTruthy()
  const html = await response.text()
  expect(html).toContain('Grok Bot Pages：别再从聊天记录里挖上周的结论')
  expect(html).toContain('application/ld+json')

  const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)
  expect(canonical).not.toBeNull()
  const origin = new URL(canonical![1]!).origin
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.ok()).toBeTruthy()
  expect(await sitemap.text()).toContain(`${origin}/article/grok-bot-pages-living-work-docs/`)
  const robots = await request.get('/robots.txt')
  expect(robots.ok()).toBeTruthy()
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`)
})
