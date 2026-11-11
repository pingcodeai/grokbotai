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
