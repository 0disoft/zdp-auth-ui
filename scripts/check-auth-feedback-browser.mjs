import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const root = process.cwd();
const [contractDeclaration, indexDeclaration, feedbackContract] = await Promise.all([
  readFile(join(root, 'dist', 'contract.d.ts'), 'utf8'),
  readFile(join(root, 'dist', 'index.d.ts'), 'utf8'),
  import(pathToFileURL(join(root, 'dist', 'contract.js')).href)
]);

assert.match(
  contractDeclaration,
  /export interface ZdpAuthFeedback \{[\s\S]*readonly code: ZdpAuthFeedbackCode;[\s\S]*readonly sequence\?: number;/,
  'The published contract declaration must expose the closed typed feedback value.'
);
assert.ok(
  indexDeclaration.includes('readonly feedback?: ZdpAuthFeedback | null;'),
  'The published AuthShell declaration must expose its typed feedback prop.'
);
assert.deepEqual(
  [...feedbackContract.zdpAuthFeedbackCodes],
  ['waiting', 'registered', 'invalid_input', 'invalid_credentials', 'rate_limited', 'expired', 'unavailable'],
  'The runtime feedback code registry must match the published contract.'
);
assert.equal(feedbackContract.isZdpAuthFeedbackCode('rate_limited'), true);
assert.equal(feedbackContract.isZdpAuthFeedbackCode('server_stack_trace'), false);
assert.equal(feedbackContract.isZdpAuthFeedbackErrorCode('invalid_credentials'), true);
assert.equal(feedbackContract.isZdpAuthFeedbackErrorCode('registered'), false);

const cacheDir = await mkdtemp(join(tmpdir(), 'zdp-auth-feedback-browser-'));
const server = await createServer({
  cacheDir,
  configFile: false,
  logLevel: 'error',
  optimizeDeps: {
    noDiscovery: true
  },
  plugins: [svelte()],
  resolve: {
    alias: [
      { find: 'zdp-auth-ui', replacement: join(root, 'dist', 'index.js') }
    ]
  },
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
  assert.ok(address && typeof address === 'object', 'Typed auth feedback fixture must expose a listening address.');

  browser = await chromium.launch({
    channel: process.env.ZDP_BROWSER_CHANNEL ?? 'chrome',
    headless: true,
    timeout: 30_000
  });
  const page = await browser.newPage();
  const browserErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(30_000);
  await page.goto(`http://127.0.0.1:${address.port}`, {
    timeout: 30_000,
    waitUntil: 'domcontentloaded'
  });

  const fixture = page.getByTestId('typed-auth-feedback-fixture');
  assert.equal(
    await fixture.getByRole('alert').getByText('Legacy fallback status.', { exact: true }).count(),
    1,
    'Legacy status and invalid props must remain available when typed feedback is absent.'
  );

  const invalidButton = fixture.getByTestId('show-invalid-credentials');
  await invalidButton.click();
  const invalidFeedback = fixture.locator('[data-feedback-code="invalid_credentials"]');
  await invalidFeedback.waitFor();
  assert.equal(await invalidFeedback.textContent(), 'Check your login ID and password.');
  assert.equal(await invalidFeedback.getAttribute('role'), 'alert');
  assert.equal(await invalidFeedback.getAttribute('aria-live'), 'assertive');
  assert.equal(await invalidFeedback.getAttribute('tabindex'), '-1');
  assert.equal(
    await invalidFeedback.evaluate((element) => document.activeElement === element),
    true,
    'A new typed error must move focus to the shared feedback surface.'
  );
  assert.equal(
    (await invalidFeedback.getAttribute('class'))?.includes('zdp-auth-shell__status--error'),
    true,
    'Typed error feedback must use the error presentation.'
  );

  await invalidButton.click();
  assert.equal(
    await invalidFeedback.evaluate((element) => document.activeElement === element),
    true,
    'Incrementing feedback.sequence must focus and announce the same error code again.'
  );

  await fixture.getByTestId('show-rate-limited').click();
  const rateLimitedFeedback = fixture.locator('[data-feedback-code="rate_limited"]');
  await rateLimitedFeedback.waitFor();
  assert.equal(
    await rateLimitedFeedback.textContent(),
    'Sign in is temporarily unavailable. Try again shortly.',
    'Rate limiting must use the locale-owned generic temporary-unavailable copy.'
  );
  assert.equal(
    await rateLimitedFeedback.evaluate((element) => document.activeElement === element),
    true,
    'Rate-limited feedback must use the shared error focus behavior.'
  );

  const registeredButton = fixture.getByTestId('show-registered');
  await registeredButton.click();
  const registeredFeedback = fixture.locator('[data-feedback-code="registered"]');
  await registeredFeedback.waitFor();
  assert.equal(await registeredFeedback.textContent(), 'Account created. Sign in to continue.');
  assert.equal(await registeredFeedback.getAttribute('role'), 'status');
  assert.equal(await registeredFeedback.getAttribute('aria-live'), 'polite');
  assert.equal(await registeredFeedback.getAttribute('tabindex'), null);
  assert.equal(
    await registeredButton.evaluate((element) => document.activeElement === element),
    true,
    'Non-error feedback must not steal focus from the user action.'
  );
  assert.equal(
    (await registeredFeedback.getAttribute('class'))?.includes('zdp-auth-shell__status--error'),
    false,
    'Non-error typed feedback must not use the error presentation.'
  );

  await fixture.getByTestId('clear-feedback').click();
  assert.equal(
    await fixture.getByRole('alert').getByText('Legacy fallback status.', { exact: true }).count(),
    1,
    'Clearing typed feedback must restore the backward-compatible legacy status path.'
  );
  assert.equal(
    await fixture.locator('[data-feedback-code]').count(),
    0,
    'Typed feedback codes must leave the DOM when the consumer clears feedback.'
  );
  assert.equal(
    await fixture.getByTestId('clear-feedback').evaluate((element) => document.activeElement === element),
    true,
    'Clearing typed feedback must not focus the unchanged legacy fallback error.'
  );

  await fixture.getByTestId('queue-typed-error').click();
  assert.equal(await fixture.locator('[data-feedback-code="invalid_credentials"]').count(), 0);
  await fixture.getByTestId('release-busy').click();
  await page.waitForFunction(() => document.activeElement?.getAttribute('data-feedback-code') === 'invalid_credentials');

  await fixture.getByTestId('queue-legacy-error').click();
  await fixture.getByTestId('release-busy').click();
  const legacyError = fixture.getByRole('alert').getByText('Legacy request failed.', { exact: true });
  await legacyError.waitFor();
  await page.waitForFunction(() => document.activeElement?.textContent === 'Legacy request failed.');
  assert.equal(await legacyError.getAttribute('tabindex'), '-1');

  await fixture.getByTestId('queue-typed-error').click();
  await fixture.getByTestId('show-registered').click();
  const releaseBusy = fixture.getByTestId('release-busy');
  await releaseBusy.click();
  await registeredFeedback.waitFor();
  assert.equal(
    await releaseBusy.evaluate((element) => document.activeElement === element),
    true,
    'A superseded error must not steal focus after busy ends.'
  );

  const legacySuccessButton = fixture.getByTestId('show-legacy-success');
  await legacySuccessButton.click();
  const legacySuccess = fixture.getByRole('status').getByText('Legacy saved.', { exact: true });
  await legacySuccess.waitFor();
  assert.equal(await legacySuccess.getAttribute('tabindex'), null);
  assert.equal((await legacySuccess.getAttribute('class'))?.includes('zdp-auth-shell__status--error'), false);
  assert.equal(await legacySuccessButton.evaluate((element) => document.activeElement === element), true);

  assert.deepEqual(browserErrors, [], `Typed auth feedback fixture must run without browser errors: ${browserErrors.join(' | ')}`);
  console.log('Typed auth feedback browser contract check passed.');
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { force: true, recursive: true });
}
