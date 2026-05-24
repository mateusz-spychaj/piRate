import { defineMiddleware } from 'astro/middleware';

const SUPPORTED = new Set(['pl', 'en']);

export const onRequest = defineMiddleware((context, next) => {
  const cookie = context.cookies.get('pirate-lang')?.value;
  if (cookie && SUPPORTED.has(cookie)) {
    context.locals.lang = cookie as 'pl' | 'en';
  } else {
    const accept = context.request.headers.get('Accept-Language') || '';
    context.locals.lang = accept.startsWith('pl') ? 'pl' : 'en';
  }
  return next();
});
