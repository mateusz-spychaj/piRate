// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  adapter: vercel({
    imageService: true,
  }),
  output: 'server',
  site: process.env.SITE_URL || 'https://pirate.mateuszspychaj.pl',
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['html-to-image'],
    },
  },
});
