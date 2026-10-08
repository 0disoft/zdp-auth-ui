import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const root = process.cwd();
const fixtureParent = join(root, '.vite');
await mkdir(fixtureParent, { recursive: true });
const fixtureRoot = await mkdtemp(join(fixtureParent, 'zdp-auth-ui-busy-'));
const cacheDir = join(fixtureRoot, '.vite-cache');

await Promise.all([
  writeFile(
    join(fixtureRoot, 'index.html'),
    '<!doctype html><html lang="en"><head><meta charset="UTF-8" /></head><body><div id="app"></div><script type="module" src="/main.ts"></script></body></html>'
  ),
  writeFile(
    join(fixtureRoot, 'BusyAuthFixture.svelte'),
    `<script lang="ts">
      import { AuthShell, PasswordField, PasskeySettings, type ZdpAuthProvider } from 'zdp-auth-ui';

      let busy = false;
      let password = '';
      let submitCount = 0;
      let providerCount = 0;
      let passkeyCount = 0;
      let modeChangeCount = 0;
      let managementBusy = false;
      let managementFeedback = null;
      let managementCount = 0;
      let managementReady = false;
      let managementKeysRemoved = false;
      let correlatedFeedback = 'saved';
      let correlatedFeedbackSequence = 0;
      let correlatedSequence = 0;
      let legacyFeedback = 'saved';
      $: managementState = { status: managementReady ? 'ready' : 'preparing', passkeys: managementKeysRemoved ? [] : [
        { passkey_id: '00000000-0000-0000-0000-000000000001', label: 'Desktop', created_at: '2026-10-02T00:00:00Z', last_used_at: null }
      ], capabilities: { register: true, rename: true, revoke: true }, reauthentication: 'password' };

      const providers: readonly ZdpAuthProvider[] = [
        { id: 'google', kind: 'oauth', label: 'Google' },
        { id: 'passkey', kind: 'passkey', label: 'Use a passkey' }
      ];
    <\/script>

    <main>
      <section data-testid="busy-auth-fixture">
        <AuthShell
          locale="en"
          mode="login"
          {busy}
          {providers}
          onsubmit={() => {
            submitCount += 1;
            document.body.dataset.authSubmitCount = String(submitCount);
            busy = true;
          }}
          onproviderselect={({ provider }) => {
            if (provider.kind === 'passkey') {
              passkeyCount += 1;
              document.body.dataset.passkeyCount = String(passkeyCount);
              busy = true;
            } else providerCount += 1;
          }}
          onmodechange={() => {
            modeChangeCount += 1;
          }}
        >
          <PasswordField
            id="busy-password"
            name="password"
            bind:value={password}
            locale="en"
            autocomplete="current-password"
            required
          />
        </AuthShell>
      </section>

      <button data-testid="clear-busy" type="button" onclick={() => (busy = false)}>Clear busy</button>
      <output data-testid="busy-submit-count">{submitCount}</output>
      <output data-testid="busy-provider-count">{providerCount}</output>
      <output data-testid="busy-passkey-count">{passkeyCount}</output>
      <output data-testid="busy-mode-count">{modeChangeCount}</output>
      <section data-testid="management-fixture">
        <PasskeySettings locale="en" state={managementState} busy={managementBusy} feedback={managementFeedback}
          onaction={(detail) => { managementCount += 1; document.body.dataset.managementCount = String(managementCount);
            document.body.dataset.managementAction = detail.action;
            managementFeedback = null; managementBusy = true; }} />
      </section>
      <button data-testid="management-ready" onclick={() => managementReady = true}>Ready</button>
      <button data-testid="management-saved" onclick={() => { managementBusy = false; managementFeedback = 'saved'; }}>Saved</button>
      <button data-testid="management-remove-keys" onclick={() => { managementKeysRemoved = true; }}>Remove keys from server snapshot</button>
      <section data-testid="correlated-fixture">
        <PasskeySettings idPrefix="correlated" locale="en" state={managementState}
          feedback={correlatedFeedback} feedbackSequence={correlatedFeedbackSequence}
          onaction={(detail) => { correlatedSequence = detail.sequence; }} />
      </section>
      <output data-testid="correlated-sequence">{correlatedSequence}</output>
      <button data-testid="correlated-stale" onclick={() => { correlatedFeedback = 'saved'; correlatedFeedbackSequence = correlatedSequence - 1; }}>Stale</button>
      <button data-testid="correlated-stale-unconfirmed" onclick={() => { correlatedFeedback = 'unconfirmed'; correlatedFeedbackSequence = correlatedSequence - 1; }}>Stale unconfirmed</button>
      <button data-testid="correlated-stale-failed" onclick={() => { correlatedFeedback = 'failed'; correlatedFeedbackSequence = correlatedSequence - 1; }}>Stale failed</button>
      <button data-testid="correlated-saved" onclick={() => { correlatedFeedback = 'saved'; correlatedFeedbackSequence = correlatedSequence; }}>Saved current</button>
      <button data-testid="correlated-failed" onclick={() => { correlatedFeedback = 'failed'; correlatedFeedbackSequence = correlatedSequence; }}>Failed current</button>
      <section data-testid="legacy-management-fixture">
        <PasskeySettings idPrefix="legacy" locale="en" state={managementState} feedback={legacyFeedback}
          onaction={() => {}} />
      </section>
      <button data-testid="legacy-failed" onclick={() => { legacyFeedback = 'failed'; }}>Legacy failed</button>
      <button data-testid="legacy-saved" onclick={() => { legacyFeedback = 'saved'; }}>Legacy saved</button>
    </main>`
  )
]);

await writeFile(
  join(fixtureRoot, 'main.ts'),
  `import { mount } from 'svelte';
   import BusyAuthFixture from './BusyAuthFixture.svelte';
   mount(BusyAuthFixture, { target: document.getElementById('app')! });`
);

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
  root: fixtureRoot,
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
  assert.ok(address && typeof address === 'object', 'Busy auth fixture server must expose a listening address.');

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
  await page.goto(`http://127.0.0.1:${address.port}`, {
    timeout: 30_000,
    waitUntil: 'domcontentloaded'
  });

  assert.deepEqual(browserErrors, [], `Busy auth fixture must load without browser errors: ${browserErrors.join(' | ')}`);

  const fixture = page.getByTestId('busy-auth-fixture');
  const form = fixture.locator('form');
  const password = fixture.getByLabel('Password', { exact: true });
  const submit = fixture.getByRole('button', { name: 'Sign in', exact: true });
  const provider = fixture.getByRole('button', { name: 'Google', exact: true });
  const passkey = fixture.getByRole('button', { name: 'Use a passkey', exact: true });
  const modeChange = fixture.getByRole('button', { name: 'Create a new account', exact: true });

  await password.fill('valid-busy-state-password');
  const sameTaskSubmitCount = await form.evaluate((element) => {
    element.requestSubmit();
    element.requestSubmit();
    return Number(document.body.dataset.authSubmitCount);
  });
  assert.equal(sameTaskSubmitCount, 1, 'Two submits in one task must emit only one auth callback.');

  assert.equal(await page.getByTestId('busy-submit-count').textContent(), '1', 'The first valid submit must reach the consumer once.');
  assert.equal(await form.getAttribute('aria-busy'), 'true', 'The form must expose its controlled busy state to assistive technology.');
  assert.equal(await submit.isDisabled(), true, 'Busy auth must disable the submit control.');
  assert.equal(await provider.isDisabled(), true, 'Busy auth must disable provider selection.');
  assert.equal(await passkey.isDisabled(), true, 'Password submission must disable passkey selection.');
  assert.equal(await modeChange.isDisabled(), true, 'Busy auth must disable mode changes without removing the control.');
  assert.equal(await password.isDisabled(), true, 'Busy auth must freeze slotted form controls through the fieldset boundary.');
  assert.equal(
    await fixture.getByRole('status').getByText('Checking now.', { exact: true }).count(),
    1,
    'Busy auth must expose the localized waiting message.'
  );

  await form.evaluate((element) => {
    if (!(element instanceof HTMLFormElement)) throw new Error('Busy auth fixture form is missing.');
    element.requestSubmit();
  });
  await provider.evaluate((element) => {
    if (!(element instanceof HTMLButtonElement)) throw new Error('Busy provider button is missing.');
    element.click();
  });
  await modeChange.evaluate((element) => {
    if (!(element instanceof HTMLButtonElement)) throw new Error('Busy mode button is missing.');
    element.click();
  });

  assert.equal(await page.getByTestId('busy-submit-count').textContent(), '1', 'Busy auth must reject duplicate programmatic submits.');
  assert.equal(await page.getByTestId('busy-provider-count').textContent(), '0', 'Busy auth must not emit provider events.');
  assert.equal(await page.getByTestId('busy-mode-count').textContent(), '0', 'Busy auth must not emit mode-change events.');

  await page.getByTestId('clear-busy').click();
  assert.equal(await form.getAttribute('aria-busy'), 'false', 'Clearing busy must restore the idle accessibility state.');
  assert.equal(await submit.isEnabled(), true, 'Clearing busy must restore submit interaction.');
  assert.equal(await provider.isEnabled(), true, 'Clearing busy must restore provider interaction.');
  assert.equal(await modeChange.isEnabled(), true, 'Clearing busy must restore mode interaction.');
  assert.equal(await password.isEnabled(), true, 'Clearing busy must restore slotted fields.');
  assert.equal(
    await fixture.getByText('Checking now.', { exact: true }).count(),
    0,
    'Clearing busy must remove the waiting status.'
  );
  await submit.click();
  assert.equal(await page.getByTestId('busy-submit-count').textContent(), '2', 'A completed request must allow a new submission.');

  await page.getByTestId('clear-busy').click();
  const sameTaskPasskeyCount = await passkey.evaluate((element) => {
    element.click();
    element.click();
    element.closest('form').requestSubmit();
    return Number(document.body.dataset.passkeyCount);
  });
  assert.equal(sameTaskPasskeyCount, 1, 'Duplicate provider clicks must start only one ceremony.');
  assert.equal(await page.getByTestId('busy-submit-count').textContent(), '2', 'Passkey selection must lock password submission in the same task.');
  assert.equal(await password.isDisabled(), true, 'Passkey requests must freeze password fields.');
  await page.getByTestId('clear-busy').click();
  assert.equal(await passkey.isEnabled(), true, 'Cancellation must restore passkey interaction.');

  const management = page.getByTestId('management-fixture');
  assert.equal(await management.locator('button').count(), 0, 'Preparing management must expose no mutation controls.');
  await page.getByTestId('management-ready').click();
  await management.getByRole('button', { name: 'Add', exact: true }).click();
  await management.locator('input[name="label"]').fill('Phone');
  const managementPassword = management.locator('input[name="current_password"]');
  await managementPassword.fill('short');
  await management.locator('form').evaluate(form => form.requestSubmit());
  assert.equal(await managementPassword.getAttribute('aria-invalid'), 'true', 'Invalid reauthentication must mark the password field.');
  const passwordErrorId = 'passkey-settings-password-error';
  assert.ok((await managementPassword.getAttribute('aria-describedby')).split(/\s+/).includes(passwordErrorId),
    'Reauthentication errors must be connected to their input.');
  assert.ok((await management.locator(`[id="${passwordErrorId}"]`).textContent()).length > 0);
  await management.locator('input[name="current_password"]').fill('fixture-password-only');
  assert.notEqual(await managementPassword.getAttribute('aria-invalid'), 'true', 'Correcting the password must clear its invalid state.');
  await management.locator('form').evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
  assert.equal(await page.locator('body').getAttribute('data-management-count'), '1', 'Duplicate management submits must hand off once.');
  assert.equal(await management.locator('input[name="current_password"]').inputValue(), '', 'Password must clear at handoff.');
  assert.equal(await management.getByRole('button', { name: 'Cancel', exact: true }).isDisabled(), true);
  await page.getByTestId('management-saved').click();
  await management.locator('form').waitFor({ state: 'detached' });
  await management.getByRole('button', { name: 'Rename', exact: true }).click();
  assert.equal(await management.locator('input[name="label"]').inputValue(), 'Desktop', 'A prior success must not close the next editor.');
  const managementName = management.locator('input[name="label"]');
  await managementName.fill('x'.repeat(81));
  await management.locator('form').evaluate(form => form.requestSubmit());
  assert.equal(await managementName.getAttribute('aria-invalid'), 'true', 'An invalid passkey label must mark its input.');
  assert.equal(await managementName.getAttribute('aria-errormessage'), 'passkey-settings-name-error');
  assert.ok((await managementName.getAttribute('aria-describedby')).split(/\s+/).includes('passkey-settings-name-error'));
  await managementName.fill('Desktop');
  assert.notEqual(await managementName.getAttribute('aria-invalid'), 'true', 'Correcting the label must clear its invalid state.');
  await management.getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.equal(await management.getByRole('button', { name: 'Rename', exact: true }).evaluate(button => button === document.activeElement), true);
  await management.getByRole('button', { name: 'Remove', exact: true }).click();
  await management.locator('input[name="current_password"]').fill('fixture-password-only');
  await management.locator('form').evaluate(form => form.requestSubmit());
  assert.equal(await page.locator('body').getAttribute('data-management-action'), 'revoke');
  assert.equal(await management.locator('input[name="current_password"]').inputValue(), '');

  const correlated = page.getByTestId('correlated-fixture');
  await correlated.getByRole('button', { name: 'Rename', exact: true }).click();
  await correlated.locator('input[name="label"]').fill('Updated desktop');
  await correlated.locator('form').evaluate(form => form.requestSubmit());
  assert.equal(await page.getByTestId('correlated-sequence').textContent(), '1');
  assert.equal(await correlated.locator('form').count(), 1, 'Old saved feedback must not close a delayed request.');
  await page.getByTestId('correlated-stale').click();
  assert.equal(await correlated.locator('form').count(), 1, 'A previous request sequence must not close the editor.');
  await page.getByTestId('correlated-stale-unconfirmed').click();
  assert.equal(await correlated.getByRole('button', { name: 'Cancel', exact: true }).isEnabled(), true, 'Stale uncertainty must not lock the current editor.');
  assert.equal(await correlated.getByRole('alert').count(), 0, 'Stale uncertainty must not render as current feedback.');
  await page.getByTestId('correlated-stale-failed').click();
  assert.equal(await correlated.getByRole('alert').count(), 0, 'Stale failures must not render as current feedback.');
  assert.equal(await page.getByTestId('correlated-stale-failed').evaluate(button => button === document.activeElement), true, 'Stale failures must not steal focus.');
  await page.getByTestId('correlated-saved').click();
  await correlated.locator('form').waitFor({ state: 'detached' });

  await correlated.getByRole('button', { name: 'Rename', exact: true }).click();
  await correlated.locator('form').evaluate(form => form.requestSubmit());
  assert.equal(await page.getByTestId('correlated-sequence').textContent(), '2');
  assert.equal(await correlated.locator('form').count(), 1, 'Unchanged saved feedback from request 1 must not close request 2.');
  await page.getByTestId('correlated-failed').click();
  assert.equal(await correlated.locator('form').count(), 1, 'Failed requests leave the editor open.');
  await correlated.locator('form').evaluate(form => form.requestSubmit());
  assert.equal(await page.getByTestId('correlated-sequence').textContent(), '3');
  await page.getByTestId('correlated-stale').click();
  assert.equal(await correlated.locator('form').count(), 1, 'Late success from request 2 must not close retry 3.');
  await page.getByTestId('correlated-saved').click();
  await correlated.locator('form').waitFor({ state: 'detached' });

  const legacy = page.getByTestId('legacy-management-fixture');
  await legacy.getByRole('button', { name: 'Rename', exact: true }).click();
  await legacy.locator('form').evaluate(form => form.requestSubmit());
  assert.equal(await legacy.locator('form').count(), 1, 'Legacy consumers must also ignore preexisting success.');
  await page.getByTestId('legacy-failed').click();
  await page.getByTestId('legacy-saved').click();
  await legacy.locator('form').waitFor({ state: 'detached' });

  await correlated.getByRole('button', { name: 'Remove', exact: true }).click();
  await correlated.locator('input[name="current_password"]').fill('fixture-password-only');
  await page.getByTestId('management-remove-keys').click();
  await correlated.locator('form').waitFor({ state: 'detached' });
  assert.equal(await correlated.locator('input[name="current_password"]').count(), 0,
    'Removing the edited credential from a server snapshot must close the editor and discard its verifier.');
  assert.equal(await page.getByTestId('correlated-sequence').textContent(), '3', 'Snapshot refresh must not dispatch a stale credential action.');

  console.log('AuthShell controlled busy-state browser check passed.');
} finally {
  await browser?.close();
  await server.close();
  await rm(fixtureRoot, { force: true, recursive: true });
}
