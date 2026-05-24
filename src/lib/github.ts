import type { PRData } from './types';
import { GITHUB_API_BASE } from './constants';
import { parseRepoUrl } from './validation';

interface GitHubPR {
  number: number;
  title: string;
  body: string | null;
  user: { login: string };
  created_at: string;
  merged_at: string;
  html_url: string;
  changed_files: number;
  additions: number;
  deletions: number;
  head: { sha: string };
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'piRate',
  };
  const token = import.meta.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function githubFetch<T>(path: string): Promise<T> {
  const url = `${GITHUB_API_BASE}${path}`;
  const response = await fetch(url, { headers: getHeaders() });

  if (response.status === 403) {
    throw new Error('errors.rateLimit');
  }
  if (response.status === 404) {
    throw new Error('errors.privateRepo');
  }
  if (!response.ok) {
    throw new Error('errors.general');
  }

  return response.json() as Promise<T>;
}

export async function fetchMergedPRs(
  repoUrl: string,
  prCount: number
): Promise<PRData[]> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new Error('errors.invalidUrl');

  const { owner, repo } = parsed;
  const perPage = Math.min(prCount * 2, 100);

  const prs = await githubFetch<GitHubPR[]>(
    `/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=${perPage}`
  );

  const merged = prs
    .filter((pr) => pr.merged_at)
    .slice(0, prCount);

  if (merged.length === 0) {
    throw new Error('errors.noPRs');
  }

  return merged.map((pr) => ({
    id: pr.number,
    number: pr.number,
    title: pr.title,
    description: pr.body ?? '',
    author: pr.user.login,
    createdAt: pr.created_at,
    changedFiles: pr.changed_files,
    additions: pr.additions,
    deletions: pr.deletions,
    url: pr.html_url,
    diffUrl: `${pr.html_url}.diff`,
    score: {
      impact: 0,
      aiLeverage: 0,
      quality: 0,
      total: 0,
      pirateSummary: '',
    },
  }));
}

export async function fetchPRDiff(
  repoUrl: string,
  prNumber: number
): Promise<string> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) return '';

  const { owner, repo } = parsed;
  const headers = getHeaders();
  headers.Accept = 'application/vnd.github.v3.diff';

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`,
      { headers }
    );
    if (!response.ok) return '';
    return response.text();
  } catch {
    return '';
  }
}
