import type { APIRoute } from 'astro';
import { analyzeRequestSchema } from '../../lib/validation';
import { fetchMergedPRs, fetchPRDiff } from '../../lib/github';
import { analyzePR } from '../../lib/llm';
import { buildRepoAnalysis } from '../../lib/scoring';
import { computeHash, getCached, setCache } from '../../lib/cache';

function sendEvent(controller: ReadableStreamDefaultController, data: Record<string, unknown>) {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Nieprawidłowe dane wejściowe' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

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
      JSON.stringify({ hash, analysis: cached }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        sendEvent(controller, { type: 'progress', step: 'fetching' });

        const prs = await fetchMergedPRs(repoUrl, prCount);

        const prsWithScores = [];
        for (let i = 0; i < prs.length; i++) {
          sendEvent(controller, {
            type: 'progress',
            step: 'analyzing',
            current: i + 1,
            total: prs.length,
          });

          const score = await analyzePR(prs[i]);
          prsWithScores.push({ ...prs[i], score });
        }

        sendEvent(controller, { type: 'progress', step: 'scoring' });

        const repoName = repoUrl.replace(/\/$/, '').split('/').slice(-2).join('/');
        const analysis = buildRepoAnalysis(repoUrl, repoName, prsWithScores);

        setCache(hash, analysis);

        sendEvent(controller, {
          type: 'complete',
          hash,
          analysis,
        });

        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'errors.general';

        const errorMessages: Record<string, string> = {
          'errors.rateLimit': 'Osiągnięto limit zapytań do GitHub API. Spróbuj ponownie za chwilę',
          'errors.privateRepo': 'Repozytorium nie istnieje lub jest prywatne',
          'errors.noPRs': 'Nie znaleziono merged pull requestów',
          'errors.invalidUrl': 'Nieprawidłowy URL repozytorium GitHub',
        };

        sendEvent(controller, {
          type: 'error',
          error: errorMessages[message] ?? 'Analiza nie powiodła się. Spróbuj ponownie',
        });

        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
