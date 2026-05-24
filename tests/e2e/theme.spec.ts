import { test, expect } from '@playwright/test';

test.describe('Theme switching', () => {
  test('should default to light theme', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should persist dark theme via localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('pirate-theme', 'dark'));
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should persist light theme via localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('pirate-theme', 'light'));
    await page.reload();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
