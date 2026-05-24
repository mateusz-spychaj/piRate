import { describe, it, expect } from 'vitest';
import type { PRData } from './types';
import { analyzePR } from './llm';

function mockPR(overrides: Partial<PRData> = {}): PRData {
  return {
    id: 1,
    number: 1,
    title: 'Test PR',
    description: 'A test pull request',
    author: 'user',
    createdAt: '2024-01-01',
    changedFiles: 3,
    additions: 50,
    deletions: 10,
    url: 'https://github.com/owner/repo/pull/1',
    diffUrl: 'https://github.com/owner/repo/pull/1.diff',
    score: { impact: 0, aiLeverage: 0, quality: 0, total: 0, pirateSummary: '' },
    ...overrides,
  };
}

describe('analyzePR (mock fallback)', () => {
  it('should return PRScore with valid structure', async () => {
    const pr = mockPR();
    const score = await analyzePR(pr);

    expect(score).toHaveProperty('impact');
    expect(score).toHaveProperty('aiLeverage');
    expect(score).toHaveProperty('quality');
    expect(score).toHaveProperty('total');
    expect(score).toHaveProperty('pirateSummary');
  });

  it('should return scores within 0-100 range', async () => {
    const pr = mockPR();
    const score = await analyzePR(pr);

    expect(score.impact).toBeGreaterThanOrEqual(0);
    expect(score.impact).toBeLessThanOrEqual(100);
    expect(score.aiLeverage).toBeGreaterThanOrEqual(0);
    expect(score.aiLeverage).toBeLessThanOrEqual(100);
    expect(score.quality).toBeGreaterThanOrEqual(0);
    expect(score.quality).toBeLessThanOrEqual(100);
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });

  it('should have a non-empty pirateSummary', async () => {
    const pr = mockPR();
    const score = await analyzePR(pr);

    expect(score.pirateSummary.length).toBeGreaterThan(0);
  });

  it('should calculate total from dimensional scores', async () => {
    const pr = mockPR({ additions: 200, changedFiles: 10 });
    const score = await analyzePR(pr);

    const expectedTotal = Math.round(score.impact * 0.4 + score.aiLeverage * 0.3 + score.quality * 0.3);
    expect(score.total).toBe(expectedTotal);
  });
});
