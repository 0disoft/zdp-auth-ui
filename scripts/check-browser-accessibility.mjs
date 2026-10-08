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
  assert.ok(address && typeof address === 'object', 'Vite auth fixture server must expose a listening address.');

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
  assert.deepEqual(browserErrors, [], `Auth browser fixture must load without browser errors: ${browserErrors.join(' | ')}`);

  const loginFixture = page.getByTestId('login-fixture');
  const password = loginFixture.locator('#browser-password');
  const submit = loginFixture.locator('form button[type="submit"]');
  assert.equal(await password.count(), 1, 'The required password field must render once.');
  assert.equal(
    await loginFixture.locator('label[for="browser-password"]', { hasText: 'Password' }).count(),
    1,
    'The required password field must have one durable label.'
  );
  assert.equal(await submit.count(), 1, 'The auth form must expose one native submit button.');

  const passwordToggle = loginFixture.getByRole('button', { name: 'Show password', exact: true });
  const passwordGeometry = await password.evaluate((input) => {
    const toggle = input.parentElement?.querySelector('button');
    if (!(toggle instanceof HTMLElement)) return null;
    const inputRect = input.getBoundingClientRect();
    const toggleRect = toggle.getBoundingClientRect();
    return {
      inputHeight: inputRect.height,
      inputCenter: inputRect.top + inputRect.height / 2,
      toggleHeight: toggleRect.height,
      toggleCenter: toggleRect.top + toggleRect.height / 2
    };
  });
  assert.ok(passwordGeometry, 'The password field must render one adjacent visibility button.');
  assert.ok(
    Math.abs(passwordGeometry.inputHeight - passwordGeometry.toggleHeight) < 0.5 &&
      Math.abs(passwordGeometry.inputCenter - passwordGeometry.toggleCenter) < 0.5,
    `Password input and visibility button must share height and center: ${JSON.stringify(passwordGeometry)}`
  );
  assert.equal(await passwordToggle.count(), 1, 'The password visibility button must keep its accessible name.');

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

  assert.equal(
    await loginFixture.getByRole('link', { name: 'I forgot my password', exact: true }).count(),
    0,
    'Recovery navigation must remain hidden unless the consumer provides an active route.'
  );
  assert.equal(
    await page.getByTestId('recovery-link-fixture').getByRole('link', { name: 'I forgot my password', exact: true }).getAttribute('href'),
    '/recovery',
    'An explicitly configured login recovery route must render unchanged.'
  );

  const japaneseLoginFixture = page.getByTestId('japanese-login-fixture');
  assert.equal(
    await japaneseLoginFixture.getByRole('heading', { name: 'ログイン', level: 1 }).count(),
    1,
    'Japanese account routes must render the Japanese auth catalog instead of English fallback.'
  );
  assert.equal(
    await japaneseLoginFixture.getByLabel('ログイン ID', { exact: true }).count(),
    1,
    'Japanese account routes must localize login fields.'
  );
  assert.equal(
    await japaneseLoginFixture.locator('.zdp-auth-shell__summary').textContent(),
    'ZDP アカウントで続行します。',
    'AuthShell must localize copy with the consumer-supplied account brand.'
  );
  const typography = await japaneseLoginFixture.evaluate((fixture) => {
    const heading = fixture.querySelector('h1');
    const summary = fixture.querySelector('.zdp-auth-shell__summary');
    const label = fixture.querySelector('.zdp-label');
    const input = fixture.querySelector('.zdp-input');
    if (![heading, summary, label, input].every((element) => element instanceof HTMLElement)) return null;
    return {
      heading: Number.parseFloat(getComputedStyle(heading).fontSize),
      summary: Number.parseFloat(getComputedStyle(summary).fontSize),
      label: Number.parseFloat(getComputedStyle(label).fontSize),
      input: Number.parseFloat(getComputedStyle(input).fontSize)
    };
  });
  assert.ok(
    typography && typography.heading >= 32 && typography.summary >= 18 && typography.label >= 16 && typography.input >= 17,
    `Account typography must use the larger shared scale: ${JSON.stringify(typography)}`
  );

  assert.equal(
    await page.getByTestId('unsafe-account-brand-fixture').locator('.zdp-auth-shell__summary').textContent(),
    'Continue with your 8ailors account.',
    'An account brand with bidi control characters must fall back to the locale catalog default.'
  );

  const signupFixture = page.getByTestId('signup-fixture');
  assert.equal(
    await signupFixture.getByRole('link', { name: 'I forgot my password', exact: true }).count(),
    0,
    'Signup must not offer password recovery navigation.'
  );
  const signupLoginId = signupFixture.getByLabel('Login ID', { exact: true });
  const signupPassword = signupFixture.getByLabel('Password', { exact: true });
  const signupTerms = signupFixture.getByLabel('I agree to the required terms.', { exact: true });
  const signupTermsLink = signupFixture.getByRole('link', { name: 'Terms', exact: true });
  assert.equal(await signupTermsLink.count(), 1, 'Signup must render one terms link beside the consent checkbox.');
  assert.equal(await signupTermsLink.getAttribute('href'), '/terms', 'Signup terms link must remain consumer-configured.');
  assert.equal(await signupTermsLink.getAttribute('target'), '_blank', 'Signup terms must open without replacing entered form data.');
  assert.equal(
    await signupTermsLink.getAttribute('rel'),
    'noopener noreferrer',
    'A new-tab signup terms link must isolate the opener context.'
  );
  const signupTermsGeometry = await signupFixture.locator('.zdp-auth-signup-terms').evaluate((row) => {
    const checkbox = row.querySelector('label');
    const checkboxMark = row.querySelector('.zdp-choice__mark');
    const checkboxLabel = row.querySelector('.zdp-choice__label');
    const link = row.querySelector('a');
    if (
      !(checkbox instanceof HTMLElement) ||
      !(checkboxMark instanceof HTMLElement) ||
      !(checkboxLabel instanceof HTMLElement) ||
      !(link instanceof HTMLElement)
    ) return null;
    const checkboxRect = checkbox.getBoundingClientRect();
    const checkboxMarkRect = checkboxMark.getBoundingClientRect();
    const checkboxLabelRect = checkboxLabel.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    return {
      checkboxRight: checkboxRect.right,
      checkboxTop: checkboxRect.top,
      markCenter: checkboxMarkRect.top + checkboxMarkRect.height / 2,
      labelCenter: checkboxLabelRect.top + checkboxLabelRect.height / 2,
      linkLeft: linkRect.left,
      linkTop: linkRect.top
    };
  });
  assert.ok(
    signupTermsGeometry &&
      signupTermsGeometry.linkLeft > signupTermsGeometry.checkboxRight &&
      Math.abs(signupTermsGeometry.linkTop - signupTermsGeometry.checkboxTop) < 2 &&
      Math.abs(signupTermsGeometry.markCenter - signupTermsGeometry.labelCenter) < 0.5,
    `Signup terms mark and link must align with the checkbox copy: ${JSON.stringify(signupTermsGeometry)}`
  );
  const signupSubmit = signupFixture.locator('form button[type="submit"]');
  await signupSubmit.click();
  assert.equal(
    await signupLoginId.evaluate((element) => document.activeElement === element),
    true,
    'Signup must focus the required login ID before any credential handoff.'
  );
  await signupLoginId.fill('browser_user');
  await signupSubmit.click();
  assert.equal(
    await signupPassword.evaluate((element) => document.activeElement === element),
    true,
    'Signup must focus the required password after login ID is present.'
  );
  await signupPassword.fill('valid-browser-signup-password');
  const confirmation = signupFixture.getByLabel('Confirm password', { exact: true });
  await signupSubmit.click();
  assert.equal(await confirmation.evaluate((element) => document.activeElement === element), true,
    'Signup must require password confirmation.');
  assert.equal(await confirmation.getAttribute('autocomplete'), 'new-password');
  await confirmation.fill('different-password');
  await confirmation.blur();
  assert.equal(await confirmation.getAttribute('aria-invalid'), 'true');
  assert.equal(await signupFixture.getByText('Passwords do not match.', { exact: true }).count(), 1);
  await signupTerms.check();
  await signupSubmit.click();
  assert.equal(await page.getByTestId('signup-submit-count').textContent(), '0',
    'Mismatched credentials must never reach the consumer.');
  await confirmation.fill('valid-browser-signup-password');
  await signupPassword.fill('changed-browser-signup-password');
  await signupSubmit.click();
  assert.equal(await page.getByTestId('signup-submit-count').textContent(), '0',
    'Changing the original password must invalidate an earlier match.');
  await signupPassword.fill('valid-browser-signup-password');
  assert.equal(await confirmation.evaluate((element) => element.validity.valid), true);
  assert.deepEqual(await signupFixture.locator('form').evaluate((form) => [...new FormData(form).keys()].sort()),
    ['age_policy_ref', 'locale', 'login_id', 'password', 'terms_accepted', 'terms_consent_ref'],
    'Confirmation must never become a transmitted form field.');
  await signupTerms.uncheck();
  await signupSubmit.click();
  assert.equal(
    await signupTerms.evaluate((element) => document.activeElement === element),
    true,
    'Signup must focus required terms acceptance before submission.'
  );
  await signupTerms.check();
  const signupAge = signupFixture.getByRole('checkbox', { name: 'I confirm I am at least 14 years old.', exact: true });
  await signupSubmit.click();
  assert.equal(await page.getByTestId('signup-submit-count').textContent(), '0', 'Missing minimum age confirmation must block submission.');
  assert.equal(await signupAge.evaluate((element) => document.activeElement === element), true);
  await signupAge.check();
  await signupSubmit.click();
  assert.equal(
    await page.getByTestId('signup-submit-count').textContent(),
    '1',
    'A complete signup form must emit exactly one consumer-owned submit event.'
  );
  assert.equal(
    await page.getByTestId('signup-submitted-fields').textContent(),
    'browser_user|password-present|true|account-minimum-age-14-v1|true|policy://terms/2026-08-01|en',
    'Signup must expose the Core-aligned login, password, terms, and locale field names to the consumer.'
  );
  assert.equal(
    await signupPassword.inputValue(),
    '',
    'The consuming fixture must be able to clear the password immediately after handoff.'
  );
  assert.equal(await confirmation.inputValue(), '', 'Clearing the password must also clear confirmation.');

  await page.getByTestId('replace-signup-contract').click();
  const resetFixture = page.getByTestId('signup-policy-reset');
  const resetTerms = resetFixture.locator('#reset-signup-terms-accepted');
  const resetAge = resetFixture.locator('#reset-signup-minimum-age-confirmed');
  assert.equal(await resetTerms.isChecked(), true);
  assert.equal(await resetAge.isChecked(), true);
  assert.equal(await signupTerms.isChecked(), true);
  assert.equal(await signupAge.isChecked(), true);
  await page.getByTestId('change-signup-terms').click();
  await resetFixture.getByRole('button', { name: 'Reset signup confirmation' }).click();
  assert.equal(await resetTerms.isChecked(), false, 'Reset must not restore acceptance of old terms.');
  assert.equal(await resetAge.isChecked(), true, 'Unchanged age policy keeps its original default.');
  assert.equal(await signupTerms.isChecked(), false, 'New terms require fresh acceptance.');
  assert.equal(await signupAge.isChecked(), true);
  await signupTerms.check();
  await page.getByTestId('change-signup-age-policy').click();
  await resetFixture.getByRole('button', { name: 'Reset signup confirmation' }).click();
  assert.equal(await resetAge.isChecked(), false, 'Reset must not restore confirmation of the old age policy.');
  assert.equal(await signupAge.isChecked(), false, 'New age policy requires fresh confirmation.');
  assert.equal(await signupTerms.isChecked(), true);
  await signupAge.check();
  await page.getByTestId('change-signup-minimum-age').click();
  assert.equal(await signupFixture.getByRole('checkbox', { name: 'I confirm I am at least 18 years old.', exact: true }).isChecked(),
    false, 'New minimum age requires fresh confirmation.');

  await password.fill('valid-browser-fixture-password');
  await submit.click();
  assert.equal(
    await page.getByTestId('submit-count').textContent(),
    '1',
    'A valid required field must allow the auth submit callback exactly once.'
  );

  const preparingFixture = page.getByTestId('auth-preparing-fixture');
  assert.equal(
    await preparingFixture.locator('form').getAttribute('data-availability'),
    'preparing',
    'The preparing auth surface must expose its availability state.'
  );
  assert.equal(
    await preparingFixture.locator('form button[type="submit"]').isDisabled(),
    true,
    'A preparing auth surface must not expose an enabled submit control.'
  );
  assert.equal(
    await preparingFixture.getByRole('status').getByText('Account access is not available yet.', { exact: true }).count(),
    1,
    'A preparing auth surface must explain the unavailable state with a status notice.'
  );
  assert.equal(
    await preparingFixture.getByRole('button', { name: 'Create a new account', exact: true }).count(),
    0,
    'A preparing auth surface must not expose a mode-change action.'
  );
  assert.equal(
    await preparingFixture.getByRole('link').count(),
    0,
    'A preparing auth surface must not expose recovery or handoff navigation links.'
  );
  await preparingFixture.getByLabel('Password', { exact: true }).fill('not-live-yet');
  await preparingFixture.getByLabel('Password', { exact: true }).press('Enter');
  assert.equal(
    await page.getByTestId('preparing-submit-count').textContent(),
    '0',
    'Implicit Enter submission must not fire a submit callback while the auth surface is preparing.'
  );

  const preparingSignupPolicy = page.getByTestId('preparing-signup-policy-fixture');
  assert.equal(
    await preparingSignupPolicy.getByRole('link', { name: 'Terms', exact: true }).getAttribute('href'),
    '/terms',
    'Preparing signup must keep the consumer-configured terms link visible when no signup fields render.'
  );
  assert.equal(
    await preparingSignupPolicy.getByRole('link', { name: 'Privacy', exact: true }).getAttribute('href'),
    '/privacy',
    'Preparing signup must keep the consumer-configured privacy link visible.'
  );
  const preparingSignupFields = page.getByTestId('preparing-signup-fields-fixture');
  assert.equal(
    await preparingSignupFields.getByRole('link', { name: 'Terms', exact: true }).count(),
    1,
    'Preparing signup with consent fields must expose only the terms link beside the checkbox.'
  );

  const distFixture = page.getByTestId('dist-auth-shell-fixture');
  assert.equal(
    await distFixture.getByRole('heading', { name: 'Sign in', level: 1 }).count(),
    1,
    'The published dist AuthShell must render its heading with the app Svelte runtime.'
  );
  assert.equal(
    await distFixture.getByLabel('Password', { exact: true }).count(),
    1,
    'The published dist AuthShell must render the consumer slot with the app Svelte runtime.'
  );
  assert.equal(
    await distFixture.locator('form').getAttribute('data-availability'),
    'available',
    'The published dist AuthShell must expose the availability gate contract.'
  );
  assert.equal(
    await distFixture.locator('form button[type="submit"]').count(),
    1,
    'The published dist AuthShell must keep one native submit control.'
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
    'plc_clock_shift_fixture_012345',
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

  const clockPage = await browser.newPage();
  const clockPageErrors = [];
  clockPage.on('pageerror', (error) => clockPageErrors.push(error.message));
  try {
    await clockPage.clock.setFixedTime('2026-07-15T04:05:00.000Z');
    await clockPage.goto(`http://127.0.0.1:${address.port}`, { waitUntil: 'domcontentloaded' });
    const clockFixture = clockPage.getByTestId('product-link-clock-shift');
    const clockApprove = clockFixture.getByRole('button', { name: 'Approve connection', exact: true });
    await clockApprove.waitFor();
    await clockPage.clock.setFixedTime('2026-07-15T04:07:00.000Z');
    await clockApprove.click();
    assert.equal(await clockFixture.getByTestId('clock-shift-decision-count').textContent(), '0', 'An expired request must not emit a decision after a delayed deadline refresh.');
    const staleStatus = clockFixture.getByRole('alert').getByText('This request is out of date. Start again from the desktop product.', { exact: true });
    await staleStatus.waitFor();
    assert.equal(await clockFixture.getByRole('button').count(), 0, 'Click-time expiry must remove decision controls.');
    const replacementFixture = clockPage.getByTestId('product-link-replacement');
    await replacementFixture.getByRole('button', { name: 'Refresh link request', exact: true }).click();
    const replacementApprove = replacementFixture.getByRole('button', { name: 'Approve connection', exact: true });
    await replacementApprove.waitFor();
    await replacementApprove.evaluate((button) => {
      const deny = [...button.closest('section').querySelectorAll('button')].find((candidate) => candidate.textContent.trim() === 'Deny');
      button.click();
      button.click();
      deny.click();
    });
    assert.equal(await replacementFixture.getByTestId('replacement-decision-count').textContent(), '1',
      'Repeated approve and deny clicks in one task must emit one decision before busy propagates.');
    await replacementApprove.click();
    assert.equal(await replacementFixture.getByTestId('replacement-decision-count').textContent(), '2',
      'A later retry must remain available when the consumer does not mark the request busy.');
    assert.deepEqual(clockPageErrors, []);
  } finally {
    await clockPage.close();
  }

  console.log('Auth UI browser accessibility, login/signup handoff, and product-link flow check passed.');
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { force: true, recursive: true });
}
