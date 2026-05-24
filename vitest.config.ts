import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      include: ['src/lib/**', 'src/i18n/pirate.ts'],
    },
  },
});
