import { defineMiddleware } from "astro/middleware";

const SUPPORTED = new Set(["pl", "en"]);

// Rate limit windows (per IP)
const ANALYZE_WINDOW_MS = 60_000;
const ANALYZE_MAX = 20;

const API_WINDOW_MS = 60_000;
const API_MAX = 120; // generous limit for /api/diff and /api/results

const analyzeLimitMap = new Map<string, { count: number; resetAt: number }>();
const apiLimitMap = new Map<string, { count: number; resetAt: number }>();

// Periodically evict expired entries to prevent unbounded memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of analyzeLimitMap) {
    if (entry.resetAt < now) analyzeLimitMap.delete(key);
  }
  for (const [key, entry] of apiLimitMap) {
    if (entry.resetAt < now) apiLimitMap.delete(key);
  }
}, 60_000);

function getClientIp(request: Request): string {
  // On Vercel, x-forwarded-for is appended by the infrastructure — the
  // rightmost value is the one added by Vercel and cannot be spoofed by
  // the client. cf-connecting-ip is used when behind Cloudflare.
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    // Last entry is appended by the trusted reverse proxy.
    return parts[parts.length - 1].trim();
  }

  return "127.0.0.1";
}

function checkRateLimit(
  map: Map<string, { count: number; resetAt: number }>,
  ip: string,
  windowMs: number,
  max: number,
): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = map.get(ip);

  if (entry && entry.resetAt > now) {
    entry.count++;
    if (entry.count > max) {
      return {
        limited: true,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      };
    }
  } else {
    map.set(ip, { count: 1, resetAt: now + windowMs });
  }

  return { limited: false, retryAfter: 0 };
}

export const onRequest = defineMiddleware((context, next) => {
  const cookie = context.cookies.get("pirate-lang")?.value;
  if (cookie && SUPPORTED.has(cookie)) {
    context.locals.lang = cookie as "pl" | "en";
  } else {
    const accept = context.request.headers.get("Accept-Language") || "";
    context.locals.lang = accept.startsWith("pl") ? "pl" : "en";
  }

  const { pathname } = context.url;
  const ip = getClientIp(context.request);

  // Strict limit for the expensive analyze endpoint.
  if (pathname === "/api/analyze" && context.request.method === "POST") {
    const { limited, retryAfter } = checkRateLimit(
      analyzeLimitMap,
      ip,
      ANALYZE_WINDOW_MS,
      ANALYZE_MAX,
    );
    if (limited) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        },
      );
    }
  }

  // Broader limit covering all other API routes (/api/diff, /api/results/*).
  if (pathname.startsWith("/api/") && pathname !== "/api/analyze") {
    const { limited, retryAfter } = checkRateLimit(
      apiLimitMap,
      ip,
      API_WINDOW_MS,
      API_MAX,
    );
    if (limited) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        },
      );
    }
  }

  return next();
});
