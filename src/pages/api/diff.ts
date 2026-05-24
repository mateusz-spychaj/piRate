import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const diffUrl = url.searchParams.get('url');
  if (!diffUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), { status: 400 });
  }

  try {
    const res = await fetch(diffUrl, {
      headers: { 'User-Agent': 'piRate/1.0' },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch diff' }), { status: res.status });
    }

    const text = await res.text();
    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch diff' }), { status: 500 });
  }
};
