import type { PRData, PRScore, RepoAnalysis, AuthorStats } from './types';
import { WEIGHTS } from './constants';
import { generateRepoPirateSummary } from '../i18n/pirate';

export function calculateScore(
  impact: number,
  aiLeverage: number,
  quality: number
): number {
  return Math.round(
    impact * WEIGHTS.impact +
    aiLeverage * WEIGHTS.aiLeverage +
    quality * WEIGHTS.quality
  );
}

function buildRecommendations(scores: PRScore[]): string[] {
  const avgImpact = scores.reduce((s, p) => s + p.impact, 0) / scores.length;
  const avgAiLeverage = scores.reduce((s, p) => s + p.aiLeverage, 0) / scores.length;
  const avgQuality = scores.reduce((s, p) => s + p.quality, 0) / scores.length;

  const recommendations: string[] = [];

  if (avgImpact < 50) {
    recommendations.push('Focus on changes with higher business impact. Prioritize features and improvements over minor fixes.');
  }
  if (avgAiLeverage < 40) {
    recommendations.push('Encourage more AI-assisted development to boost productivity and code consistency.');
  }
  if (avgQuality < 50) {
    recommendations.push('Improve PR quality by keeping changes focused, adding tests, and following code review guidelines.');
  }
  if (avgImpact < 30 && avgQuality < 30) {
    recommendations.push('Consider establishing PR templates and quality gates to maintain codebase health.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Great job! Keep up the high-quality pull request practices.');
  }

  return recommendations;
}

export function buildAuthorStats(prs: PRData[]): AuthorStats[] {
  const grouped = new Map<string, PRData[]>();
  for (const pr of prs) {
    const existing = grouped.get(pr.author) ?? [];
    existing.push(pr);
    grouped.set(pr.author, existing);
  }

  return Array.from(grouped.entries()).map(([author, authorPRs]) => {
    const scores = authorPRs.map((p) => p.score);
    const avgImpact = Math.round(scores.reduce((s, p) => s + p.impact, 0) / scores.length);
    const avgAiLeverage = Math.round(scores.reduce((s, p) => s + p.aiLeverage, 0) / scores.length);
    const avgQuality = Math.round(scores.reduce((s, p) => s + p.quality, 0) / scores.length);
    const avgTotal = calculateScore(avgImpact, avgAiLeverage, avgQuality);

    const sorted = [...authorPRs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const firstHalf = sorted.slice(0, Math.ceil(sorted.length / 2));
    const secondHalf = sorted.slice(Math.ceil(sorted.length / 2));
    const firstAvg = firstHalf.length
      ? firstHalf.reduce((s, p) => s + p.score.total, 0) / firstHalf.length
      : 0;
    const secondAvg = secondHalf.length
      ? secondHalf.reduce((s, p) => s + p.score.total, 0) / secondHalf.length
      : 0;
    const trend: 'up' | 'down' | 'stable' =
      secondAvg > firstAvg + 5 ? 'up' : secondAvg < firstAvg - 5 ? 'down' : 'stable';

    return { author, prCount: authorPRs.length, avgImpact, avgAiLeverage, avgQuality, avgTotal, trend };
  }).sort((a, b) => b.avgTotal - a.avgTotal);
}

export function buildRepoAnalysis(
  repoUrl: string,
  repoName: string,
  prs: PRData[]
): RepoAnalysis {
  const scores = prs.map((pr) => pr.score);

  const avgImpact = Math.round(scores.reduce((s, p) => s + p.impact, 0) / scores.length);
  const avgAiLeverage = Math.round(scores.reduce((s, p) => s + p.aiLeverage, 0) / scores.length);
  const avgQuality = Math.round(scores.reduce((s, p) => s + p.quality, 0) / scores.length);
  const totalScore = calculateScore(avgImpact, avgAiLeverage, avgQuality);

  return {
    repoUrl,
    repoName,
    totalScore,
    avgImpact,
    avgAiLeverage,
    avgQuality,
    pirateSummary: generateRepoPirateSummary(totalScore, prs.length),
    prs,
    authorStats: buildAuthorStats(prs),
    recommendations: buildRecommendations(scores),
    analyzedAt: new Date().toISOString(),
  };
}
