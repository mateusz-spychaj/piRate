import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });

const mock = {
  repoUrl: 'https://github.com/facebook/react',
  repoName: 'facebook/react',
  totalScore: 85,
  avgImpact: 90,
  avgAiLeverage: 78,
  avgQuality: 86,
  pirateSummary: 'Arrr, this codebase be shipshape! React crew be codin\' like true scallywags!',
  prs: [
    { id: 1, number: 28405, title: 'Add useOptimistic Hook', description: 'Implements useOptimistic', author: 'acdlite', createdAt: '2026-05-01', changedFiles: 12, additions: 450, deletions: 30, url: 'https://github.com/facebook/react/pull/28405', diffUrl: 'https://github.com/facebook/react/pull/28405.diff', score: { impact: 92, aiLeverage: 75, quality: 88, total: 86, pirateSummary: '' } },
    { id: 2, number: 28390, title: 'refactor: simplify reconciler loop', description: 'Simplify reconciler', author: 'sebmarkbage', createdAt: '2026-04-28', changedFiles: 8, additions: 120, deletions: 200, url: 'https://github.com/facebook/react/pull/28390', diffUrl: 'https://github.com/facebook/react/pull/28390.diff', score: { impact: 88, aiLeverage: 82, quality: 90, total: 87, pirateSummary: '' } },
    { id: 3, number: 28375, title: 'fix: memory leak in Suspense', description: 'Fix Suspense leak', author: 'acdlite', createdAt: '2026-04-25', changedFiles: 3, additions: 45, deletions: 12, url: 'https://github.com/facebook/react/pull/28375', diffUrl: 'https://github.com/facebook/react/pull/28375.diff', score: { impact: 85, aiLeverage: 70, quality: 78, total: 79, pirateSummary: '' } },
  ],
  recommendations: ['Consider splitting large PRs into smaller focused changes'],
  authorStats: [
    { author: 'acdlite', prCount: 2, avgImpact: 88.5, avgAiLeverage: 72.5, avgQuality: 83, avgTotal: 82.5, trend: 'up' },
    { author: 'sebmarkbage', prCount: 1, avgImpact: 88, avgAiLeverage: 82, avgQuality: 90, avgTotal: 87, trend: 'stable' },
  ],
  analyzedAt: new Date().toISOString(),
};

// --- Score screenshot (results page, 1280x900) ---
const scorePage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await scorePage.goto('http://localhost:4321/');
await scorePage.evaluate((data) => { sessionStorage.setItem('pirate-analysis-demo', JSON.stringify(data)); }, mock);
await scorePage.goto('http://localhost:4321/results/demo');
await scorePage.waitForLoadState('networkidle');
await scorePage.waitForTimeout(1000);
await scorePage.screenshot({ path: 'data/score.png', fullPage: true });
await scorePage.close();

// --- Performance screenshot (landing page, full page) ---
const perfPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await perfPage.goto('http://localhost:4321/');
await perfPage.waitForLoadState('networkidle');
await perfPage.waitForTimeout(500);
await perfPage.screenshot({ path: 'data/performance.png', fullPage: true });
await perfPage.close();

await browser.close();
