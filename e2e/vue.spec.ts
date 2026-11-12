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
