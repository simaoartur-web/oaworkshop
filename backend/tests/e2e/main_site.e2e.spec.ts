import { test, expect } from '@playwright/test'

test('frontend loads', async ({ page }) => {
  await page.goto('http://localhost:5173')

  // Check for the names seen in the screenshot earlier
  await expect(page.locator('text=Osvaldo Luís')).toBeVisible()
  await expect(page.locator('text=Artur Simão')).toBeVisible()
})
