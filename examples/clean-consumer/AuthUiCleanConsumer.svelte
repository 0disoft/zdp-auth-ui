<script lang="ts">
  import {
    AuthShell,
    PasswordField,
    ProductLinkApproval,
    buildZdpAuthHandoffUrl,
    getAuthMessages,
    type ZdpAuthMode,
    type ZdpAuthHandoffResult,
    type ZdpAuthProvider,
    type ZdpAuthSubmitDetail,
    type ZdpProductLinkRequest,
    type ZdpProductLinkTrustPolicy
  } from 'zdp-auth-ui';

  let mode: ZdpAuthMode = 'login';
  let locale = 'en';
  let password = '';
  let status = '';
  let invalid = false;

  const loginHandoff: ZdpAuthHandoffResult = buildZdpAuthHandoffUrl({
    mode: 'login',
    productId: 'melamed',
    trustedAuthOrigin: 'https://accounts.zdp.example',
    returnPath: '/apply'
  });
  const signupHandoff: ZdpAuthHandoffResult = buildZdpAuthHandoffUrl({
    mode: 'signup',
    productId: 'melamed',
    trustedAuthOrigin: 'https://accounts.zdp.example',
    returnPath: '/apply'
  });

  const productLinkChallengeRef = 'plc_clean_consumer_0123456789';
  const trustedProductLinkVerificationUri = `https://accounts.zdp.example/auth/product-link?challenge=${productLinkChallengeRef}`;
  const productLinkRequest: ZdpProductLinkRequest = {
    challengeRef: productLinkChallengeRef,
    verificationUri: trustedProductLinkVerificationUri,
    state: 'pending',
    productLabel: 'Talos Desktop',
    requestedItems: [
      {
        ref: 'workspace_read_012345',
        kind: 'scope',
        label: 'Workspace identity',
        description: 'Use the selected workspace reference for this connection.'
      }
    ],
    accountLabel: 'Signed-in ZDP account',
    workspaceLabel: 'Personal workspace',
    consentImplications: ['The product receives opaque account and consent references.'],
    issuedAt: '2026-07-15T04:04:00.000Z',
    expiresAt: '2026-07-15T04:14:00.000Z'
  };
  const productLinkTrust: ZdpProductLinkTrustPolicy = {
    expectedChallengeRef: productLinkChallengeRef,
    expectedVerificationUri: trustedProductLinkVerificationUri,
    allowedVerificationOrigins: ['https://accounts.zdp.example'],
    verificationPath: '/auth/product-link',
    maxRequestAgeMs: 120_000
  };

  $: messages = getAuthMessages(locale);
  $: providers = buildProviders(messages.providers);

  function buildProviders(labels: ReturnType<typeof getAuthMessages>['providers']): readonly ZdpAuthProvider[] {
    return [
      {
        id: 'passkey',
        kind: 'passkey',
        label: labels.passkey
      },
      {
        id: 'google',
        kind: 'oauth',
        label: labels.google
      },
      {
        id: 'email',
        kind: 'email',
        label: labels.email
      }
    ];
  }

  function handleSubmit(detail: ZdpAuthSubmitDetail): void {
    invalid = false;
    status = detail.mode === 'recovery' ? messages.status.waiting : '';
  }
</script>

<section class="clean-consumer" aria-labelledby="clean-consumer-title">
  <h2 id="clean-consumer-title">Clean consumer fixture</h2>
  <AuthShell
    {locale}
    {mode}
    {providers}
    {status}
    {invalid}
    termsHref="/terms"
    privacyHref="/privacy"
    onsubmit={handleSubmit}
    onmodechange={(detail) => {
      mode = detail.mode;
      status = '';
    }}
    onproviderselect={() => {
      status = messages.status.waiting;
    }}
  >
    <PasswordField
      id="clean-consumer-password"
      name="password"
      bind:value={password}
      {locale}
      autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
      helpText={mode === 'signup' ? 'Use a password you do not use anywhere else.' : null}
      errorText={invalid ? messages.status.error : null}
      required
    />
  </AuthShell>

  <nav class="auth-handoff-links" aria-label={messages.navigation.accountHelp}>
    {#if loginHandoff.outcome === 'created'}
      <a href={loginHandoff.url}>{messages.links.login}</a>
    {/if}
    {#if signupHandoff.outcome === 'created'}
      <a href={signupHandoff.url}>{messages.links.signup}</a>
    {/if}
  </nav>

  <ProductLinkApproval
    id="clean-consumer-product-link"
    {locale}
    request={productLinkRequest}
    trust={productLinkTrust}
  />
</section>

<style>
  .clean-consumer {
    display: grid;
    gap: var(--zdp-space-4);
    max-width: 32rem;
    min-width: 0;
  }

  .clean-consumer h2 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-font-size-lg);
    line-height: var(--zdp-font-line-height-tight);
    margin: 0;
  }

  .auth-handoff-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-3);
  }
</style>
