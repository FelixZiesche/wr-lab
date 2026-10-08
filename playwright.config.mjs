// Playwright-Tests für WR-Lab. Start mit `npm test` (startet vorher den Firebase-Emulator).
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: /.*\.spec\.mjs$/,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:5000',
    browserName: 'chromium',
    locale: 'de-DE',
    trace: 'retain-on-failure'
  }
});
