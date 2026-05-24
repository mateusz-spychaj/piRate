import { createHash } from 'node:crypto';
import type { RepoAnalysis } from './types';
import { CACHE_TTL_MS } from './constants';

interface CacheEntry {
  analysis: RepoAnalysis;
  timestamp: number;
}

const store = new Map<string, CacheEntry>();

export function computeHash(repoUrl: string, prCount: number): string {
  return createHash('sha256')
    .update(`${repoUrl}|${prCount}`)
    .digest('hex')
    .slice(0, 12);
}

export function getCached(hash: string): RepoAnalysis | null {
  const entry = store.get(hash);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    store.delete(hash);
    return null;
  }
  return entry.analysis;
}

export function setCache(hash: string, analysis: RepoAnalysis): void {
  store.set(hash, { analysis, timestamp: Date.now() });
}

export function getCachedByUrl(repoUrl: string, prCount: number): RepoAnalysis | null {
  return getCached(computeHash(repoUrl, prCount));
}
