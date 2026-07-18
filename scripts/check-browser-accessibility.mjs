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

  const loginFixture = page.getByTestId('login-fixture');
  const password = loginFixture.getByLabel('Password', { exact: true });
  const submit = loginFixture.locator('form button[type="submit"]');
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

  const loginHandoff = page.getByTestId('melamed-login-handoff');
  const signupHandoff = page.getByTestId('melamed-signup-handoff');
  assert.equal(
    await loginHandoff.getAttribute('href'),
    'https://accounts.zdp.example/login?product_id=melamed&return_path=%2Fapply',
    'The rendered Melamed login link must preserve the canonical closed-registry handoff URL.'
  );
  assert.equal(
    await signupHandoff.getAttribute('href'),
    'https://accounts.zdp.example/signup?product_id=melamed&return_path=%2Fapply',
    'The rendered Melamed signup link must preserve the canonical closed-registry handoff URL.'
  );
  assert.equal(
    await page.getByTestId('rejected-auth-handoff').count(),
    0,
    'A rejected return path must not become a browser navigation surface.'
  );
  assert.equal(
    (await page.getByTestId('auth-handoff-fixture').innerHTML()).includes('untrusted.example'),
    false,
    'Rejected handoff input must not be serialized into the browser DOM.'
  );

  const approveFixture = page.getByTestId('product-link-approve');
  const fixtureUrl = page.url();
  assert.equal(
    await approveFixture.getByRole('heading', { name: 'Connect desktop product', level: 1 }).count(),
    1,
    'The product-link screen must expose one named heading.'
  );
  for (const visibleText of [
    'Talos Desktop',
    'Workspace identity',
    'Remote account features',
    'Signed-in ZDP account',
    'Personal workspace',
    'Request expires',
    'The product receives opaque account and consent references.',
    'This approval does not sync product data.'
  ]) {
    assert.equal(
      await approveFixture.getByText(visibleText, { exact: true }).count(),
      1,
      `The approval screen must show its review context: ${visibleText}`
    );
  }

  const approveButton = approveFixture.getByRole('button', { name: 'Approve connection', exact: true });
  const denyButton = approveFixture.getByRole('button', { name: 'Deny', exact: true });
  assert.equal(await approveButton.count(), 1, 'A trusted pending request must expose an explicit approve button.');
  assert.equal(await denyButton.count(), 1, 'A trusted pending request must expose an explicit deny button.');
  assert.equal(await approveFixture.locator('a').count(), 0, 'The product-link approval surface must not expose callback navigation.');
  await approveButton.focus();
  await page.keyboard.press('Enter');
  const approvedStatus = approveFixture.getByText('Connection approved.', { exact: true });
  await approvedStatus.waitFor();
  assert.equal(await approvedStatus.evaluate((element) => document.activeElement === element), true, 'Approval completion must move focus to its status.');
  assert.equal(
    await approveFixture.getByRole('button').count(),
    0,
    'An approved request must remove both decision controls.'
  );

  const denyFixture = page.getByTestId('product-link-deny');
  const denyDecision = denyFixture.getByRole('button', { name: 'Deny', exact: true });
  await denyDecision.focus();
  await page.keyboard.press(' ');
  const deniedStatus = denyFixture.getByText('Connection denied.', { exact: true });
  await deniedStatus.waitFor();
  assert.equal(await deniedStatus.evaluate((element) => document.activeElement === element), true, 'Denial completion must move focus to its status.');
  assert.equal(
    await denyFixture.getByRole('button').count(),
    0,
    'A denied request must remove both decision controls.'
  );
  assert.equal(
    await page.getByTestId('completion-count').textContent(),
    '2',
    'The fake API must receive exactly one approve and one deny decision.'
  );
  assert.equal(page.url(), fixtureUrl, 'Approve and deny decisions must not navigate to a product callback.');

  for (const [testId, role, status] of [
    ['product-link-unsafe', 'alert', 'This connection request is not trusted. Start again from the desktop product.'],
    ['product-link-stale', 'alert', 'This request is out of date. Start again from the desktop product.'],
    ['product-link-expired', 'alert', 'This request expired. Start again from the desktop product.'],
    ['product-link-consumed', 'status', 'This request was already used. Check the desktop product for its status.'],
    ['product-link-disabled', 'alert', 'Desktop product connection is not available yet.']
  ]) {
    const fixture = page.getByTestId(testId);
    assert.equal(await fixture.getByRole('button').count(), 0, `${testId} must fail closed without decision controls.`);
    assert.equal(await fixture.getByRole(role).getByText(status, { exact: true }).count(), 1, `${testId} must explain the closed state.`);
  }

  const renderedProductLinkHtml = await page
    .locator('[data-testid^="product-link-"]')
    .evaluateAll((elements) => elements.map((element) => element.innerHTML).join('\n'));
  for (const challengeRef of [
    'plc_approve_fixture_0123456789',
    'plc_deny_fixture_012345678901',
    'plc_unsafe_fixture_012345678',
    'plc_stale_fixture_0123456789',
    'plc_expired_fixture_01234567',
    'plc_consumed_fixture_0123456',
    'plc_disabled_fixture_0123456'
  ]) {
    assert.equal(
      renderedProductLinkHtml.includes(challengeRef),
      false,
      'Opaque challenge references must not be rendered into the DOM.'
    );
  }
  for (const privateText of ['accounts.zdp.example', '/auth/product-link', 'proof_verifier', 'session_cookie']) {
    assert.equal(
      renderedProductLinkHtml.includes(privateText),
      false,
      `Verification and credential material must not be rendered into the DOM: ${privateText}`
    );
  }

  console.log('Auth UI browser accessibility, login/signup handoff, and product-link flow check passed.');
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { force: true, recursive: true });
}
