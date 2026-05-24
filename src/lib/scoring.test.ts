import { describe, it, expect } from 'vitest';
import { calculateScore, buildRepoAnalysis } from './scoring';
import type { PRData } from './types';

describe('calculateScore', () => {
  it('should calculate weighted score with default weights (40/30/30)', () => {
    const score = calculateScore(100, 100, 100);
    expect(score).toBe(100);
  });

  it('should apply weights correctly', () => {
    const score = calculateScore(50, 0, 0);
    expect(score).toBe(20);
  });

  it('should round the result', () => {
    const score = calculateScore(33, 33, 33);
    expect(score).toBe(33);
  });

  it('should handle zero values', () => {
    const score = calculateScore(0, 0, 0);
    expect(score).toBe(0);
  });
});

describe('buildRepoAnalysis', () => {
  const mockPR = (overrides: Partial<PRData> = {}): PRData => ({
    id: 1,
    number: 1,
    title: 'Test PR',
    description: '',
    author: 'user',
    createdAt: '2024-01-01',
    changedFiles: 3,
    additions: 50,
    deletions: 10,
    url: 'https://github.com/owner/repo/pull/1',
    diffUrl: 'https://github.com/owner/repo/pull/1.diff',
    score: { impact: 80, aiLeverage: 70, quality: 90, total: 80, pirateSummary: 'Arrr!' },
    ...overrides,
  });

  it('should compute repo analysis with correct averages', () => {
    const pr1 = mockPR({ score: { impact: 100, aiLeverage: 100, quality: 100, total: 100, pirateSummary: 'A' } });
    const pr2 = mockPR({ id: 2, number: 2, score: { impact: 0, aiLeverage: 0, quality: 0, total: 0, pirateSummary: 'B' } });

    const analysis = buildRepoAnalysis('https://github.com/owner/repo', 'owner/repo', [pr1, pr2]);

    expect(analysis.totalScore).toBe(50);
    expect(analysis.avgImpact).toBe(50);
    expect(analysis.avgAiLeverage).toBe(50);
    expect(analysis.avgQuality).toBe(50);
    expect(analysis.prs).toHaveLength(2);
    expect(analysis.repoUrl).toBe('https://github.com/owner/repo');
    expect(analysis.repoName).toBe('owner/repo');
    expect(analysis.recommendations.length).toBeGreaterThan(0);
  });

  it('should generate notaro recommendations for high scores', () => {
    const pr = mockPR({ score: { impact: 90, aiLeverage: 90, quality: 90, total: 90, pirateSummary: 'A' } });
    const analysis = buildRepoAnalysis('https://github.com/owner/repo', 'owner/repo', [pr]);

    expect(analysis.recommendations).toContain('Great job! Keep up the high-quality pull request practices.');
  });

  it('should include analyzedAt timestamp', () => {
    const pr = mockPR();
    const analysis = buildRepoAnalysis('https://github.com/owner/repo', 'owner/repo', [pr]);

    expect(analysis.analyzedAt).toBeDefined();
    expect(new Date(analysis.analyzedAt).toISOString()).toBe(analysis.analyzedAt);
  });
});
