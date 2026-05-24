import { test, expect } from '@playwright/test';

test.describe('Language switching', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([]);
  });

  test('should default to English without cookie', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('should switch to Polish with cookie', async ({ page }) => {
    await page.context().addCookies([
      { name: 'pirate-lang', value: 'pl', domain: 'localhost', path: '/' },
    ]);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
    await expect(page.locator('text=Jak to działa')).toBeVisible();
  });

  test('should switch to English with cookie', async ({ page }) => {
    await page.context().addCookies([
      { name: 'pirate-lang', value: 'en', domain: 'localhost', path: '/' },
    ]);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('text=How it works')).toBeVisible();
  });
});
