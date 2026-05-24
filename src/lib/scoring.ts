import type { PRData, PRScore, RepoAnalysis } from './types';
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
    recommendations: buildRecommendations(scores),
    analyzedAt: new Date().toISOString(),
  };
}
