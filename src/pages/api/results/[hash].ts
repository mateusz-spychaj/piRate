import type { APIRoute } from 'astro';
import { getCached } from '../../../lib/cache';

export const GET: APIRoute = async ({ params }) => {
  const { hash } = params;

  if (!hash || hash.length !== 12) {
    return new Response(
      JSON.stringify({ error: 'Nieprawidłowy hash' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const analysis = getCached(hash);

  if (!analysis) {
    return new Response(
      JSON.stringify({ error: 'Wyniki nie znalezione lub wygasły. Przeprowadź ponownie analizę' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify(analysis),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
