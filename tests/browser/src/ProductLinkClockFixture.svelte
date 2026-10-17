<script lang="ts">
  import ProductLinkApproval from '../../../src/lib/compat/ProductLinkApproval.svelte';
  import type { ZdpProductLinkRequest, ZdpProductLinkTrustPolicy } from '../../../src/lib/product-link';
  let sequence = 0, decisions = 0, enabled = false;
  let locale = 'en';
  let request: ZdpProductLinkRequest;
  let trust: ZdpProductLinkTrustPolicy;
  function start(scenario: 'fresh' | 'stale' | 'expired' | 'formatting' = 'fresh') {
    const challengeRef = `plc_monotonic_clock_fixture_${++sequence}`, wall = Date.now();
    const lifetime = scenario === 'formatting' ? 20_000 : 1000;
    const issuedAt = scenario === 'stale' || scenario === 'expired' ? wall - 2000 : wall;
    const expiresAt = scenario === 'expired' ? wall - 1000 : wall + lifetime;
    const verificationUri = `https://accounts.zdp.example/auth/product-link?challenge=${challengeRef}`;
    request = { challengeRef, verificationUri, state: 'pending', productLabel: 'Fixture desktop', accountLabel: 'Fixture account', workspaceLabel: null,
      requestedItems: [{ ref: 'fixture_read', kind: 'scope', label: 'Read fixture', description: 'Local test only' }], consentImplications: ['Fixture consent'],
      issuedAt: new Date(issuedAt).toISOString(), expiresAt: new Date(expiresAt).toISOString() };
    trust = { expectedChallengeRef: challengeRef, expectedVerificationUri: verificationUri, allowedVerificationOrigins: ['https://accounts.zdp.example'], verificationPath: '/auth/product-link', maxRequestAgeMs: lifetime };
    enabled = true;
  }
</script>

<section data-testid="link-clock-fixture">
  <button type="button" data-testid="clock-new-request" onclick={() => start()}>New clock fixture request</button>
  <button type="button" data-testid="clock-stale-request" onclick={() => start('stale')}>Stale clock fixture request</button>
  <button type="button" data-testid="clock-expired-request" onclick={() => start('expired')}>Expired clock fixture request</button>
  <button type="button" data-testid="clock-format-request" onclick={() => start('formatting')}>Formatting fixture request</button>
  <button type="button" data-testid="clock-locale" onclick={() => { locale = locale === 'en' ? 'ko' : 'en'; }}>Change formatting locale</button>
  <button type="button" data-testid="clock-invalid-locale" onclick={() => { locale = 'invalid_locale'; }}>Invalid formatting locale</button>
  <button type="button" data-testid="clock-same-request" onclick={() => { request = { ...request }; }}>Refresh same clock fixture request</button>
  {#if enabled}
    <ProductLinkApproval id="monotonic-link" {enabled} {request} {trust} {locale} ondecision={() => { decisions++; }} />
  {/if}
  <output data-testid="clock-decisions">{decisions}</output>
</section>
