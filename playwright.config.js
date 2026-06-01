const {defineConfig} = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests/e2e/playwright',
  timeout: 60000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3003',
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: {
    command:
      'ROOT=$PWD/tests/demo ./dist/index.js serve -p 3003 -e production',
    url: 'http://localhost:3003/abe/editor/',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
