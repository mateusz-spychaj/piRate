import type { PRData, PRScore } from './types';
import { generatePirateSummary } from '../i18n/pirate';

interface LLMResponse {
  impact: number;
  aiLeverage: number;
  quality: number;
  reasoning: string;
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getConfig() {
  return {
    apiKey: import.meta.env.OPENROUTER_API_KEY as string | undefined,
    model: (import.meta.env.LLM_MODEL as string) || 'openai/gpt-4o-mini',
    siteUrl: import.meta.env.SITE_URL as string || 'https://pirate-rate.vercel.app',
  };
}

function buildPrompt(pr: PRData): string {
  return `You are a code reviewer. Analyze this pull request and rate it on three dimensions from 0-100.

Pull Request: #${pr.number} - ${pr.title}
Author: ${pr.author}
Description: ${pr.description}
Files changed: ${pr.changedFiles}
Additions: ${pr.additions}
Deletions: ${pr.deletions}

Rate these dimensions:
- impact: Does this PR bring real value? Significant feature changes, architecture improvements, performance enhancements. (0-100)
- aiLeverage: How much does it look like AI wrote the code? Consider structured patterns, boilerplate generation, complex regex, consistent formatting. Higher means more AI-written. (0-100)
- quality: Engineering quality. Is the PR focused? Is the code clean, well-structured? Are there tests? (0-100)

Return ONLY valid JSON with no markdown formatting:
{
  "impact": <number>,
  "aiLeverage": <number>,
  "quality": <number>,
  "reasoning": "<one sentence explaining the scores>"
}`;
}

function generateMockScore(pr: PRData): PRScore {
  const base = Math.random() * 40 + 30;
  const impact = Math.round(Math.min(100, base + (pr.additions > 100 ? 20 : 0)));
  const aiLeverage = Math.round(Math.min(100, Math.random() * 60 + 20));
  const quality = Math.round(Math.min(100, base + (pr.changedFiles <= 5 ? 15 : 0)));
  const total = Math.round(impact * 0.4 + aiLeverage * 0.3 + quality * 0.3);

  return {
    impact,
    aiLeverage,
    quality,
    total,
    pirateSummary: generatePirateSummary(impact, aiLeverage, quality),
  };
}

function parseLLMResponse(content: string): { impact: number; aiLeverage: number; quality: number } {
  const cleaned = content
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as LLMResponse;

    const clamp = (n: number) => Math.round(Math.max(0, Math.min(100, n)));

    return {
      impact: clamp(parsed.impact),
      aiLeverage: clamp(parsed.aiLeverage),
      quality: clamp(parsed.quality),
    };
  } catch {
    const nums = cleaned.match(/\b(\d{1,3})\b/g);
    if (nums && nums.length >= 3) {
      return {
        impact: Math.round(Math.max(0, Math.min(100, parseInt(nums[0], 10)))),
        aiLeverage: Math.round(Math.max(0, Math.min(100, parseInt(nums[1], 10)))),
        quality: Math.round(Math.max(0, Math.min(100, parseInt(nums[2], 10)))),
      };
    }
    throw new Error('Failed to parse LLM response');
  }
}

export async function analyzePR(pr: PRData): Promise<PRScore> {
  const config = getConfig();

  if (!config.apiKey) {
    return generateMockScore(pr);
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        'HTTP-Referer': config.siteUrl,
        'X-Title': 'piRate',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'user', content: buildPrompt(pr) },
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, await response.text());
      return generateMockScore(pr);
    }

    const data = await response.json() as {
      choices: { message: { content: string } }[];
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return generateMockScore(pr);
    }

    const scores = parseLLMResponse(content);

    return {
      ...scores,
      total: Math.round(scores.impact * 0.4 + scores.aiLeverage * 0.3 + scores.quality * 0.3),
      pirateSummary: generatePirateSummary(scores.impact, scores.aiLeverage, scores.quality),
    };
  } catch (err) {
    console.error('LLM analysis failed:', err);
    return generateMockScore(pr);
  }
}
