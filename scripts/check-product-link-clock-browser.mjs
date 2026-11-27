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
  await page.clock.install({ time: '2026-07-15T04:04:00.000Z' });
  await page.clock.pauseAt('2026-07-15T04:05:00.000Z');
  await page.clock.setFixedTime('2026-07-15T04:05:00.000Z');
  await page.goto(`http://127.0.0.1:${address.port}`, { waitUntil: 'domcontentloaded' });
  const fixture = page.getByTestId('link-clock-fixture'), fresh = fixture.getByTestId('clock-new-request'), refresh = fixture.getByTestId('clock-same-request');
  await fresh.waitFor();
  await page.evaluate(() => {
    window.clockFixtureTimers = [];
    window.clockFixtureFormatters = [];
    const schedule = window.setTimeout.bind(window);
    window.setTimeout = (callback, delay, ...args) => {
      // Svelte event delegation also schedules zero-delay tasks; observe only this component.
      if (new Error().stack?.includes('/components/ProductLinkApproval.svelte:')) window.clockFixtureTimers.push(delay ?? 0);
      return schedule(callback, delay, ...args);
    };
    Intl.DateTimeFormat = new Proxy(Intl.DateTimeFormat, {
      construct(target, args) {
        if (args[1]?.year === 'numeric' && args[1]?.timeZoneName === 'short') window.clockFixtureFormatters.push(args[0]);
        return Reflect.construct(target, args);
      }
    });
  });
  const approve = fixture.getByRole('button', { name: 'Approve connection', exact: true });
  await fresh.click(); await approve.waitFor();
  assert.deepEqual(await page.evaluate(() => window.clockFixtureFormatters), ['en']);
  await approve.focus();
  await page.clock.setFixedTime('2026-07-15T04:04:55.000Z');
  // Advance timers and performance.now independently of the wall clock.
  await page.clock.runFor(999);
  assert.equal(await approve.count(), 1, 'approval remains visible immediately before expiry');
  await page.clock.runFor(1);
  assert.equal(await approve.count(), 0, 'wall-clock rollback must not extend the one-second request lifetime');
  assert.equal(await fixture.getByRole('alert').evaluate(status => status.ownerDocument.activeElement === status), true,
    'expiry preserves keyboard focus on the status in light DOM');
  assert.equal(await fixture.getByTestId('clock-decisions').textContent(), '0');
  await fresh.click(); await approve.waitFor();
  await page.clock.setFixedTime('2026-07-15T04:04:57.000Z'); await refresh.click();
  await fixture.getByRole('alert').waitFor(); assert.equal(await approve.count(), 0);
  await page.clock.setFixedTime('2026-07-15T04:04:55.000Z'); await refresh.click();
  assert.equal(await approve.count(), 0, 'refreshing an expired request after clock rollback must not revive its approval controls');
  await fresh.click(); await approve.waitFor(); await approve.click();
  assert.equal(await fixture.getByTestId('clock-decisions').textContent(), '1', 'a different newly issued challenge retains its own fresh lifetime');

  await fixture.getByTestId('clock-aging-request').click(); await approve.waitFor();
  await page.clock.runFor(1000);
  assert.equal(await approve.count(), 1, 'the maximum request age is inclusive');
  await page.clock.runFor(1);
  const status = fixture.getByRole('alert');
  const staleText = 'This request is out of date. Start again from the desktop product.';
  const expiredText = 'This request expired. Start again from the desktop product.';
  assert.equal((await status.textContent()).trim(), staleText);
  assert.equal(await approve.count(), 0, 'freshness expiry removes approval controls');
  await page.clock.runFor(1498);
  assert.equal((await status.textContent()).trim(), staleText);
  await page.clock.runFor(1);
  assert.equal((await status.textContent()).trim(), expiredText, 'the stale request expires without a parent refresh');

  await page.evaluate(() => { window.clockFixtureTimers = []; });
  await fixture.getByTestId('clock-stale-request').click();
  await status.waitFor();
  assert.equal((await status.textContent()).trim(), staleText);
  assert.equal(await approve.count(), 0);
  await refresh.click();
  await page.clock.runFor(1000);
  assert.equal((await status.textContent()).trim(), expiredText, 'a stale request must still transition at its future expiry');
  const staleTimers = await page.evaluate(() => window.clockFixtureTimers);
  assert.ok(staleTimers.length > 0 && staleTimers.every(delay => delay > 0), 'past freshness deadlines must not schedule zero-delay callbacks');

  await page.evaluate(() => { window.clockFixtureTimers = []; });
  await fixture.getByTestId('clock-expired-request').click(); await status.waitFor();
  await refresh.click(); await page.clock.runFor(100);
  assert.deepEqual(await page.evaluate(() => window.clockFixtureTimers), [], 'initially expired pending requests must not schedule another deadline');

  await fixture.getByTestId('clock-future-request').click();
  await status.waitFor();
  await page.clock.runFor(999);
  assert.equal(await approve.count(), 0);
  await page.clock.runFor(1);
  assert.equal(await approve.count(), 1, 'a future-issued request becomes actionable at the skew boundary');

  const formatterCount = await page.evaluate(() => window.clockFixtureFormatters.length);
  await fixture.getByTestId('clock-format-request').click(); await approve.waitFor();
  await page.clock.setFixedTime('2026-07-15T04:04:56.000Z');
  await fixture.getByTestId('clock-format-request').click(); await refresh.click();
  assert.equal(await page.evaluate(() => window.clockFixtureFormatters.length), formatterCount, 'request and expiry updates reuse the current locale formatter');
  const englishDate = await fixture.locator('time').textContent();
  await fixture.getByTestId('clock-locale').click();
  assert.notEqual(await fixture.locator('time').textContent(), englishDate, 'changing the locale updates the formatted date');
  assert.equal(await page.evaluate(() => window.clockFixtureFormatters.length), formatterCount + 1);
  await fixture.getByTestId('clock-invalid-locale').click();
  assert.equal(await fixture.locator('time').textContent(), englishDate, 'invalid locale uses the English formatter');
  assert.deepEqual(await page.evaluate(() => window.clockFixtureFormatters.slice(-2)), ['invalid_locale', 'en']);
  const fallbackCount = await page.evaluate(() => window.clockFixtureFormatters.length);
  await fixture.getByTestId('clock-format-request').click(); await refresh.click();
  assert.equal(await page.evaluate(() => window.clockFixtureFormatters.length), fallbackCount, 'fallback formatter is also reused');

  await page.clock.setFixedTime('2026-07-15T05:00:00.000Z');
  await fixture.getByTestId('clock-format-request').click();
  await approve.waitFor();
  await page.clock.setFixedTime('2026-07-15T05:00:18.000Z');
  await refresh.click();
  assert.equal(await approve.count(), 1, 'the forward-adjusted clock is still inside the request lifetime');
  await page.clock.setFixedTime('2026-07-15T05:00:00.000Z');
  await page.clock.runFor(1999);
  assert.equal(await approve.count(), 1);
  await page.clock.runFor(1);
  assert.equal(await approve.count(), 0, 'elapsed time continues from the latest observed wall clock after rollback');

  await page.evaluate(() => { window.mountShadowProductLinkClockFixture(); });
  const shadow = page.locator('#shadow-product-link-host').getByTestId('link-clock-fixture');
  await shadow.getByTestId('clock-new-request').click();
  const shadowApprove = shadow.getByRole('button', { name: 'Approve connection', exact: true });
  await shadowApprove.focus();
  assert.equal(await shadowApprove.evaluate(button => button.getRootNode().activeElement === button), true);
  await page.clock.runFor(1000);
  const shadowStatus = shadow.getByRole('alert');
  await shadowStatus.waitFor();
  assert.equal(await shadowStatus.evaluate(status => status.getRootNode().activeElement === status), true,
    'expiry must move focus from a disappearing approval control to its status inside Shadow DOM');
  assert.deepEqual(errors, []);
  console.log('Product-link chained expiry, light/Shadow DOM focus, future-only deadlines and formatter reuse browser check passed.');
} finally { await browser?.close(); await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
