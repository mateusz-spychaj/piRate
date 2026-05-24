import { describe, it, expect } from 'vitest';
import { analyzeRequestSchema, parseRepoUrl } from './validation';

describe('analyzeRequestSchema', () => {
  it('should accept valid GitHub URL and prCount', () => {
    const result = analyzeRequestSchema.safeParse({
      repoUrl: 'https://github.com/owner/repo',
      prCount: 5,
    });
    expect(result.success).toBe(true);
  });

  it('should accept URL with trailing slash', () => {
    const result = analyzeRequestSchema.safeParse({
      repoUrl: 'https://github.com/owner/repo/',
      prCount: 3,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid URL format', () => {
    const result = analyzeRequestSchema.safeParse({
      repoUrl: 'https://gitlab.com/owner/repo',
      prCount: 3,
    });
    expect(result.success).toBe(false);
  });

  it('should reject URL without owner/repo', () => {
    const result = analyzeRequestSchema.safeParse({
      repoUrl: 'https://github.com/',
      prCount: 3,
    });
    expect(result.success).toBe(false);
  });

  it('should reject too high prCount', () => {
    const result = analyzeRequestSchema.safeParse({
      repoUrl: 'https://github.com/owner/repo',
      prCount: 11,
    });
    expect(result.success).toBe(false);
  });

  it('should reject too low prCount', () => {
    const result = analyzeRequestSchema.safeParse({
      repoUrl: 'https://github.com/owner/repo',
      prCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should default prCount to 3', () => {
    const result = analyzeRequestSchema.safeParse({
      repoUrl: 'https://github.com/owner/repo',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prCount).toBe(3);
    }
  });

  it('should reject empty URL', () => {
    const result = analyzeRequestSchema.safeParse({
      repoUrl: '',
      prCount: 3,
    });
    expect(result.success).toBe(false);
  });
});

describe('parseRepoUrl', () => {
  it('should parse owner and repo from valid GitHub URL', () => {
    const result = parseRepoUrl('https://github.com/owner/repo');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('should handle URL with trailing slash', () => {
    const result = parseRepoUrl('https://github.com/owner/repo/');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('should handle hyphens in names', () => {
    const result = parseRepoUrl('https://github.com/my-org/my-repo');
    expect(result).toEqual({ owner: 'my-org', repo: 'my-repo' });
  });

  it('should return null for invalid URL', () => {
    const result = parseRepoUrl('not-a-url');
    expect(result).toBeNull();
  });
});
