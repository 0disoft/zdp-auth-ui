<script lang="ts">
  import { flushSync } from 'svelte';
  import ProductLinkApproval from '../../../src/lib/components/ProductLinkApproval.svelte';
  import { messages } from '../../../src/lib/i18n/en';
  import type { ZdpProductLinkRequest, ZdpProductLinkTrustPolicy } from '../../../src/lib/product-link';

  const now = new Date('2026-10-20T00:00:00Z');
  let request: ZdpProductLinkRequest = $state()!;
  let trust: ZdpProductLinkTrustPolicy = $state()!;
  let sequence = 0;
  let show = $state(true);
  let fixture: HTMLElement;
  let outside: HTMLButtonElement;

  function replace() {
    const challengeRef = `plc_focus_fixture_${++sequence}`;
    const verificationUri = `https://accounts.zdp.example/auth/product-link?challenge=${challengeRef}`;
    request = { challengeRef, verificationUri, state: 'pending', productLabel: 'Fixture desktop',
      accountLabel: 'Fixture account', workspaceLabel: null, requestedItems: [
        { ref: 'fixture_read', kind: 'scope', label: 'Read fixture', description: 'Local test only' }
      ], consentImplications: ['Fixture consent'], issuedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 60_000).toISOString() };
    trust = { expectedChallengeRef: challengeRef, expectedVerificationUri: verificationUri,
      allowedVerificationOrigins: ['https://accounts.zdp.example'], verificationPath: '/auth/product-link', maxRequestAgeMs: 60_000 };
  }
  export function reset() { flushSync(() => { replace(); show = true; }); }
  export function transition(next: 'replace' | 'outside' | 'remove' | 'settle') {
    flushSync(() => { request = { ...request, state: 'approved' }; });
    if (next === 'replace') {
      flushSync(replace);
      fixture.querySelector<HTMLButtonElement>('.zdp-product-link button')?.focus();
    } else if (next === 'remove') {
      flushSync(() => { show = false; });
      outside.focus();
    } else if (next === 'outside') outside.focus();
  }
  replace();
</script>

<section bind:this={fixture} data-testid="product-link-focus-fixture">
  {#if show}<ProductLinkApproval id="focus-link" {messages} {request} {trust} {now} enabled />{/if}
  <button bind:this={outside} type="button" data-testid="link-focus-outside">Outside approval</button>
</section>
