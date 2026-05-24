import { defineMiddleware } from 'astro/middleware';

const SUPPORTED = new Set(['pl', 'en']);

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 20;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (entry.resetAt < now) rateLimitMap.delete(key);
  }
}, 60_000);

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const cf = request.headers.get('cf-connecting-ip');
  if (cf) return cf;
  return '127.0.0.1';
}

export const onRequest = defineMiddleware((context, next) => {
  const cookie = context.cookies.get('pirate-lang')?.value;
  if (cookie && SUPPORTED.has(cookie)) {
    context.locals.lang = cookie as 'pl' | 'en';
  } else {
    const accept = context.request.headers.get('Accept-Language') || '';
    context.locals.lang = accept.startsWith('pl') ? 'pl' : 'en';
  }

  if (context.url.pathname === '/api/analyze' && context.request.method === 'POST') {
    const ip = getClientIp(context.request);
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (entry && entry.resetAt > now) {
      entry.count++;
      if (entry.count > RATE_LIMIT_MAX) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(retryAfter),
            },
          }
        );
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    }
  }

  return next();
});
