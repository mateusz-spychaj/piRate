/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly OPENROUTER_API_KEY?: string;
  readonly LLM_MODEL?: string;
  readonly GITHUB_TOKEN?: string;
  readonly SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
