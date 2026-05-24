import { describe, it, expect, beforeEach } from 'vitest';
import { computeHash, getCached, setCache } from './cache';
import type { RepoAnalysis } from './types';

function mockAnalysis(overrides: Partial<RepoAnalysis> = {}): RepoAnalysis {
  return {
    repoUrl: 'https://github.com/owner/repo',
    repoName: 'owner/repo',
    totalScore: 75,
    avgImpact: 80,
    avgAiLeverage: 70,
    avgQuality: 75,
    pirateSummary: 'Arrr!',
    prs: [],
    recommendations: ['Keep up the good work!'],
    analyzedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('computeHash', () => {
  it('should return a 12-character hex string', () => {
    const hash = computeHash('https://github.com/owner/repo', 3);
    expect(hash).toHaveLength(12);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it('should return same hash for same inputs', () => {
    const h1 = computeHash('https://github.com/owner/repo', 3);
    const h2 = computeHash('https://github.com/owner/repo', 3);
    expect(h1).toBe(h2);
  });

  it('should return different hash for different URLs', () => {
    const h1 = computeHash('https://github.com/owner/repo', 3);
    const h2 = computeHash('https://github.com/other/repo', 3);
    expect(h1).not.toBe(h2);
  });

  it('should return different hash for different prCount', () => {
    const h1 = computeHash('https://github.com/owner/repo', 3);
    const h2 = computeHash('https://github.com/owner/repo', 5);
    expect(h1).not.toBe(h2);
  });
});

describe('cache', () => {
  it('should store and retrieve a value', () => {
    const hash = computeHash('https://github.com/owner/repo', 3);
    const analysis = mockAnalysis({ totalScore: 42 });

    setCache(hash, analysis);
    const retrieved = getCached(hash);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.totalScore).toBe(42);
  });

  it('should return null for missing hash', () => {
    const result = getCached('nonexistent');
    expect(result).toBeNull();
  });
});
