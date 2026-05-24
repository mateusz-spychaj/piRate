import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('should load with correct title and key sections', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/πRate/);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('text=How it works').or(page.locator('text=Jak to działa'))).toBeVisible();
    await expect(page.locator('text=As seen in').or(page.locator('text=Zauważeni w'))).toBeVisible();
    await expect(page.locator('text=What do we rate').or(page.locator('text=Co oceniamy'))).toBeVisible();
  });

  test('should have working repo URL input', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[type="url"]');
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    await input.fill('https://github.com/owner/repo');
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('should show settings popover on gear click', async ({ page }) => {
    await page.goto('/');
    const settingsBtn = page.locator('button[aria-label*="Ustawienia" i], button[aria-label*="settings" i]');
    await settingsBtn.click();
    await expect(page.locator('input[type="range"]')).toBeVisible();
  });
});
