import { z } from 'zod';
import { MIN_PR_COUNT, MAX_PR_COUNT } from './constants';

const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;

export const analyzeRequestSchema = z.object({
  repoUrl: z
    .string()
    .min(1, 'URL jest wymagany')
    .regex(githubUrlPattern, 'Nieprawidłowy URL repozytorium GitHub'),
  prCount: z
    .number()
    .int()
    .min(MIN_PR_COUNT)
    .max(MAX_PR_COUNT)
    .default(3),
});

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = url.replace(/\/$/, '').match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}
