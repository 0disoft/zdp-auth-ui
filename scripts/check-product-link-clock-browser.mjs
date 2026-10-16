import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const root = process.cwd(), cacheDir = await mkdtemp(join(tmpdir(), 'zdp-product-link-clock-'));
const server = await createServer({ cacheDir, configFile: false, logLevel: 'error', optimizeDeps: { noDiscovery: true }, plugins: [svelte()],
  resolve: { alias: [{ find: /^zdp-auth-ui$/, replacement: join(root, 'dist', 'index.js') }] },
  root: join(root, 'tests/browser'), server: { hmr: false, host: '127.0.0.1', port: 0 } });
let browser;
try {
  await server.listen(); const address = server.httpServer.address(); assert.ok(address && typeof address === 'object');
  browser = await chromium.launch({ channel: process.env.ZDP_BROWSER_CHANNEL ?? 'chrome', headless: true });
  const page = await browser.newPage(), errors = []; page.setDefaultTimeout(8000); page.on('pageerror', error => errors.push(error.message));
  // Fresh Vite caches compile the shared Svelte graph before the fixture loads.
  page.setDefaultNavigationTimeout(60000);
  await page.clock.setFixedTime('2026-07-15T04:05:00.000Z');
  await page.goto(`http://127.0.0.1:${address.port}`, { waitUntil: 'domcontentloaded' });
  const fixture = page.getByTestId('link-clock-fixture'), fresh = fixture.getByTestId('clock-new-request'), refresh = fixture.getByTestId('clock-same-request');
  const approve = fixture.getByRole('button', { name: 'Approve connection', exact: true });
  await fresh.click(); await approve.waitFor();
  await page.clock.setFixedTime('2026-07-15T04:04:55.000Z');
  // Real timers and performance.now continue while only the wall clock moves back.
  await page.waitForTimeout(1400);
  assert.equal(await approve.count(), 0, 'wall-clock rollback must not extend the one-second request lifetime');
  assert.equal(await fixture.getByTestId('clock-decisions').textContent(), '0');
  await fresh.click(); await approve.waitFor();
  await page.clock.setFixedTime('2026-07-15T04:04:57.000Z'); await refresh.click();
  await fixture.getByRole('alert').waitFor(); assert.equal(await approve.count(), 0);
  await page.clock.setFixedTime('2026-07-15T04:04:55.000Z'); await refresh.click();
  assert.equal(await approve.count(), 0, 'refreshing an expired request after clock rollback must not revive its approval controls');
  await fresh.click(); await approve.waitFor(); await approve.click();
  assert.equal(await fixture.getByTestId('clock-decisions').textContent(), '1', 'a different newly issued challenge retains its own fresh lifetime');
  assert.deepEqual(errors, []);
  console.log('Product-link monotonic expiry, same-request refresh and new-challenge recovery browser check passed.');
} finally { await browser?.close(); await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
