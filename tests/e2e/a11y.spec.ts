import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('landing page should have no axe violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('results page should have no axe violations (with mock data)', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const mockAnalysis = {
        repoUrl: 'https://github.com/owner/repo',
        repoName: 'owner/repo',
        totalScore: 78,
        avgImpact: 82,
        avgAiLeverage: 71,
        avgQuality: 80,
        pirateSummary: 'Arrr, this repo be a treasure trove!',
        prs: [
          {
            id: 1,
            number: 42,
            title: 'Fix critical bug',
            description: 'Fixes a critical issue',
            author: 'dev1',
            createdAt: '2026-01-01',
            changedFiles: 5,
            additions: 100,
            deletions: 20,
            url: 'https://github.com/owner/repo/pull/42',
            diffUrl: 'https://github.com/owner/repo/pull/42.diff',
            score: { impact: 85, aiLeverage: 70, quality: 80, total: 78, pirateSummary: '' },
          },
        ],
        recommendations: ['Keep up the good work!'],
        authorStats: [],
        analyzedAt: new Date().toISOString(),
      };
      sessionStorage.setItem('pirate-analysis-mock123', JSON.stringify(mockAnalysis));
    });

    await page.goto('/results/mock123');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });
});
