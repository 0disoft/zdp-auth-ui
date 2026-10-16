<script lang="ts">
  import ProductLinkApproval from '../../../src/lib/compat/ProductLinkApproval.svelte';
  import type { ZdpProductLinkRequest, ZdpProductLinkTrustPolicy } from '../../../src/lib/product-link';
  let sequence = 0, decisions = 0, enabled = false;
  let request: ZdpProductLinkRequest;
  let trust: ZdpProductLinkTrustPolicy;
  function start() {
    const challengeRef = `plc_monotonic_clock_fixture_${++sequence}`, wall = Date.now();
    const verificationUri = `https://accounts.zdp.example/auth/product-link?challenge=${challengeRef}`;
    request = { challengeRef, verificationUri, state: 'pending', productLabel: 'Fixture desktop', accountLabel: 'Fixture account', workspaceLabel: null,
      requestedItems: [{ ref: 'fixture_read', kind: 'scope', label: 'Read fixture', description: 'Local test only' }], consentImplications: ['Fixture consent'],
      issuedAt: new Date(wall).toISOString(), expiresAt: new Date(wall + 1000).toISOString() };
    trust = { expectedChallengeRef: challengeRef, expectedVerificationUri: verificationUri, allowedVerificationOrigins: ['https://accounts.zdp.example'], verificationPath: '/auth/product-link', maxRequestAgeMs: 1000 };
    enabled = true;
  }
</script>

<section data-testid="link-clock-fixture">
  <button type="button" data-testid="clock-new-request" onclick={start}>New clock fixture request</button>
  <button type="button" data-testid="clock-same-request" onclick={() => { request = { ...request }; }}>Refresh same clock fixture request</button>
  {#if enabled}
    <ProductLinkApproval id="monotonic-link" {enabled} {request} {trust} ondecision={() => { decisions++; }} />
  {/if}
  <output data-testid="clock-decisions">{decisions}</output>
</section>
