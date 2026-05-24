import type { APIRoute } from "astro";

// Allowlist of hosts this proxy is permitted to fetch from.
// Prevents SSRF attacks against internal infrastructure or cloud metadata endpoints.
const ALLOWED_HOSTS = new Set(["github.com", "raw.githubusercontent.com"]);

function isAllowedUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" && ALLOWED_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export const GET: APIRoute = async ({ url }) => {
  const diffUrl = url.searchParams.get("url");
  if (!diffUrl) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
    });
  }

  if (!isAllowedUrl(diffUrl)) {
    return new Response(JSON.stringify({ error: "URL not allowed" }), {
      status: 403,
    });
  }

  try {
    const res = await fetch(diffUrl, {
      headers: { "User-Agent": "piRate/1.0" },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch diff" }), {
        status: res.status,
      });
    }

    const text = await res.text();
    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch diff" }), {
      status: 500,
    });
  }
};
