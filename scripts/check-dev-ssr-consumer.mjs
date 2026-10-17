import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createServer } from 'vite';

// Resolve public exports through the Svelte-aware dev pipeline. Plain Node's
// precompiled SSR fallback is checked separately.
const fixtures = new Map(['zdp-auth-ui', 'zdp-auth-ui/components'].map((entry, index) => {
  const content = `<div data-dev-content>nested content</div>
    <PasswordSignupFields idPrefix="dev-signup" {contract} {messages} />`;
  return [`virtual:auth-dev-${index}.svelte`, `<script>
    import { AuthShell, PasswordSignupFields } from '${entry}';
    import { createZdpPasswordSignupContract } from 'zdp-auth-ui';
    import { messages } from 'zdp-auth-ui/i18n/ko';
    ${index === 0 ? "export let availability = 'available';" : "let { availability = 'available' } = $props();"}
    const result = createZdpPasswordSignupContract({ termsConsentRef: 'policy://terms/2026-08-01',
      agePolicyRef: 'account-minimum-age-14-v1', minimumAgeYears: 14, locale: 'ko' });
    if (result.outcome !== 'created') throw new Error('Invalid dev SSR fixture contract.');
    const contract = result.contract;
  </script>
  <AuthShell locale="ko" mode="signup" {availability} {messages}
    termsHref="https://example.test/terms" signupTermsInSlot>
    ${index === 0 ? content : `{#snippet children()}${content}{/snippet}`}
  </AuthShell>`];
}));
const cacheDir = await mkdtemp(join(tmpdir(), 'zdp-auth-dev-ssr-'));
const server = await createServer({
  configFile: false,
  cacheDir,
  logLevel: 'error',
  plugins: [{
    name: 'auth-dev-ssr-fixtures',
    resolveId(id) { return fixtures.has(id) ? id : null; },
    load(id) { return fixtures.get(id) ?? null; }
  }, svelte()],
  ssr: { noExternal: ['zdp-auth-ui', 'zdp-design-system'] },
  server: { middlewareMode: true, watch: null, hmr: false }
});

try {
  const { render } = await server.ssrLoadModule('svelte/server');
  for (const id of fixtures.keys()) {
    const parent = await server.ssrLoadModule(id);
    const { body } = render(parent.default);
    assert.match(body, /data-dev-content/);
    assert.match(body, /nested content/);
    assert.match(body, /id="dev-signup-login-id"/);
    assert.match(body, /href="https:\/\/example.test\/terms"/);
  }
  const signup = await server.ssrLoadModule(resolve('tests/bundles/KoreanPasswordSignup.svelte'));
  const { body: signupBody } = render(signup.default);
  assert.match(signupBody, /id="bundle-signup-login-id"/);
  assert.match(signupBody, /name="terms_consent_ref" value="signup-bundle-terms-v1"/);
  assert.match(signupBody, /name="age_policy_ref" value="signup-bundle-age-v1"/);
  assert.match(signupBody, /name="locale" value="ko"/);
  const passkeys = await server.ssrLoadModule(resolve('tests/browser/src/PasskeyReauthFixture.svelte'));
  const { body: passkeyBody } = render(passkeys.default, { props: { layout: 'directory' } });
  assert.equal((passkeyBody.match(/data-testid="passkey-action-icon"/g) ?? []).length, 3,
    'The named trigger snippet must render each directory icon under SSR.');
  console.log('Public Svelte entries render legacy children and native snippets in dev SSR with shared terms context.');
} finally {
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
}
