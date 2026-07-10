import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const root = process.cwd();
const cacheDir = await mkdtemp(join(tmpdir(), 'zdp-auth-ui-browser-'));
const server = await createServer({
  cacheDir,
  configFile: false,
  logLevel: 'error',
  optimizeDeps: {
    noDiscovery: true
  },
  plugins: [svelte()],
  root: join(root, 'tests/browser'),
  server: {
    hmr: false,
    host: '127.0.0.1',
    port: 0,
    strictPort: false
  }
});

let browser;

try {
  await server.listen();
  const address = server.httpServer?.address();
  assert.ok(address && typeof address === 'object', 'Vite auth fixture server must expose a listening address.');

  browser = await chromium.launch({
    channel: process.env.ZDP_BROWSER_CHANNEL ?? 'chrome',
    headless: true,
    timeout: 30_000
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(30_000);
  await page.goto(`http://127.0.0.1:${address.port}`, {
    timeout: 30_000,
    waitUntil: 'domcontentloaded'
  });

  const password = page.getByLabel('Password', { exact: true });
  const submit = page.locator('form button[type="submit"]');
  assert.equal(await password.count(), 1, 'The required password field must have one durable label.');
  assert.equal(await submit.count(), 1, 'The auth form must expose one native submit button.');

  await submit.click();
  const invalidState = await password.evaluate((element) => ({
    focused: document.activeElement === element,
    invalid: !element.validity.valid
  }));
  assert.deepEqual(
    invalidState,
    { focused: true, invalid: true },
    'Native constraint validation must focus and expose the empty required password field as invalid.'
  );
  assert.equal(
    await page.getByTestId('submit-count').textContent(),
    '0',
    'Native validation must block the auth submit callback while the required field is empty.'
  );

  await password.fill('valid-browser-fixture-password');
  await submit.click();
  assert.equal(
    await page.getByTestId('submit-count').textContent(),
    '1',
    'A valid required field must allow the auth submit callback exactly once.'
  );

  console.log('Auth UI browser accessibility check passed.');
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { force: true, recursive: true });
}
