# πRate Architecture

## Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Browser     │────▶│  Astro/SSR   │────▶│  API Routes  │
│  (React      │     │  (Vercel)    │     │  (Serverless) │
│   islands)   │     │              │     │              │
└─────────────┘     └──────────────┘     └──────────────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │  OpenRouter   │
                                        │  (LLM)        │
                                        └──────────────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │  GitHub API   │
                                        │  (public)     │
                                        └──────────────┘
```

## Directory Structure

```
src/
├── components/
│   ├── islands/        # React components (hydrated client-side)
│   │   ├── HeaderControls.tsx   # Theme + Language switchers
│   │   ├── RepoInput.tsx        # URL input + settings popover
│   │   ├── ScoreOverview.tsx    # Animated score ring + bars
│   │   ├── PRList.tsx           # PR list with diff links
│   │   ├── AuthorBreakdown.tsx  # Per-author stats table
│   │   ├── RadarChart.tsx       # Radar chart (recharts)
│   │   ├── ExportButton.tsx     # JSON + PNG export
│   │   └── Results.tsx          # Main results dashboard
│   └── landing/         # Astro components (100% static)
│       ├── Hero.astro
│       ├── HowItWorks.astro
│       ├── ScoringDimensions.astro
│       ├── SocialProof.astro
│       ├── StatsSection.astro
│       ├── DemoPreview.astro
│       └── Footer.astro
├── layouts/
│   └── Layout.astro     # HTML shell + sticky header
├── lib/
│   ├── scoring.ts       # Scoring logic + authorStats
│   ├── llm.ts           # OpenRouter API integration
│   ├── github.ts        # GitHub API client
│   ├── cache.ts         # In-memory LRU cache
│   ├── validation.ts    # Zod schemas
│   └── types.ts         # TypeScript interfaces
├── i18n/
│   ├── index.ts         # Translation function + language API
│   ├── pl.json
│   └── en.json
├── pages/
│   ├── index.astro      # Landing page
│   └── results/
│       └── [hash].astro # Results page (SSR with fallback)
├── middleware.ts        # Rate limiter + language detection
└── styles/
    └── global.css       # Tailwind v4 + custom animations
```

## Data Flow

### Analysis Request

```
1. User enters GitHub repo URL
2. RepoInput validates URL (Zod) → POST /api/analyze
3. Middleware checks rate limit (20 POST/min/IP)
4. API route resolves owner/repo from URL
5. GitHub API fetches merged PRs (up to N, default 3)
6. For each PR:
   a. Fetch PR metadata (title, description, diffUrl, stats)
   b. Send to OpenRouter LLM for scoring
   c. Stream progress via SSE (Server-Sent Events)
7. Results aggregated → scoring weights applied
8. Response cached (in-memory LRU, TTL 1h)
9. Response returned → stored in sessionStorage + SSR-embedded
```

### Results Rendering

```
1. React islands hydrate from SSR-embedded JSON
2. On refresh: sessionStorage fallback
3. If empty: re-fetch from cache key (hash URL)
4. ScoreOverview animates on viewport enter (IntersectionObserver)
5. All interactive widgets hydrate independently (no JS waterfalls)
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Astro islands (not SPA) | Landing page = zero JS, perfect Lighthouse |
| React 19 for interactivity | Islands hydrate independently per component |
| SSE streaming | Real-time progress per PR analysis |
| sessionStorage + SSR data | Survive refresh on same browser |
| in-memory LRU cache | Fast response for repeat queries (per-instance) |
| Hash-based results URL | Shareable without server-side storage |
| Zod validation | Input validation at boundary (URL, API request) |
| Strict TypeScript | No `any`, explicit error boundaries |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analyze` | Analyze repo's PRs (rate-limited) |
| GET | `/results/[hash]` | SSR results page from cache key |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | No | — | API key for real LLM scoring |
| `LLM_MODEL` | No | `meta-llama/llama-3.1-8b-instruct` | OpenRouter model |
| `SITE_URL` | No | `http://localhost:4321` | Canonical URL |
| `GITHUB_TOKEN` | No | — | Higher GitHub API rate limit |

## Testing

- **Unit tests**: Vitest (`src/lib/*.test.ts`) — scoring, cache, validation, LLM
- **E2E tests**: Playwright (`tests/e2e/`) — landing, language, theme, a11y
- **All tests**: `npm run test:all`
- **Typecheck**: `npm run typecheck`
