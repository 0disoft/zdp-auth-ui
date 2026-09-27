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
      import { AuthShell, PasswordField, type ZdpAuthProvider } from 'zdp-auth-ui';

      let busy = false;
      let password = '';
      let submitCount = 0;
      let providerCount = 0;
      let modeChangeCount = 0;

      const providers: readonly ZdpAuthProvider[] = [
        { id: 'google', kind: 'oauth', label: 'Google' }
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
          onproviderselect={() => {
            providerCount += 1;
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
      <output data-testid="busy-mode-count">{modeChangeCount}</output>
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

  console.log('AuthShell controlled busy-state browser check passed.');
} finally {
  await browser?.close();
  await server.close();
  await rm(fixtureRoot, { force: true, recursive: true });
}
