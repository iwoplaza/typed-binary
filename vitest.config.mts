import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const browserTests = 'packages/**/*.browser.test.ts';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['packages/**/*.test.ts'],
          exclude: [browserTests, '**/node_modules/**'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'browser',
          include: [browserTests],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
          },
        },
      },
    ],
  },
});
