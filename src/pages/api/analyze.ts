import type { APIRoute } from 'astro';
import { analyzeRequestSchema } from '../../lib/validation';
import { fetchMergedPRs } from '../../lib/github';
import { analyzePR } from '../../lib/llm';
import { buildRepoAnalysis } from '../../lib/scoring';
import { computeHash, getCached, setCache } from '../../lib/cache';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = analyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return new Response(
        JSON.stringify({ error: (firstIssue as { message?: string })?.message ?? 'Nieprawidłowe dane wejściowe' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { repoUrl, prCount } = parsed.data;

    const hash = computeHash(repoUrl, prCount);
    const cached = getCached(hash);
    if (cached) {
      return new Response(
        JSON.stringify({ hash }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prs = await fetchMergedPRs(repoUrl, prCount);

    const prsWithScores = await Promise.all(
      prs.map(async (pr) => {
        const score = await analyzePR(pr);
        return { ...pr, score };
      })
    );

    const repoName = repoUrl.replace(/\/$/, '').split('/').slice(-2).join('/');
    const analysis = buildRepoAnalysis(repoUrl, repoName, prsWithScores);

    setCache(hash, analysis);

    return new Response(
      JSON.stringify({ hash }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'errors.general';

    const knownErrors: Record<string, { status: number; message: string }> = {
      'errors.rateLimit': { status: 429, message: 'Osiągnięto limit zapytań do GitHub API. Spróbuj ponownie za chwilę' },
      'errors.privateRepo': { status: 403, message: 'Repozytorium nie istnieje lub jest prywatne' },
      'errors.noPRs': { status: 404, message: 'Nie znaleziono merged pull requestów' },
      'errors.invalidUrl': { status: 400, message: 'Nieprawidłowy URL repozytorium GitHub' },
    };

    const known = knownErrors[message];
    if (known) {
      return new Response(
        JSON.stringify({ error: known.message }),
        { status: known.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('Analysis error:', err);
    return new Response(
      JSON.stringify({ error: 'Analiza nie powiodła się. Spróbuj ponownie' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
