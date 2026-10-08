<script lang="ts">
  import {
    AuthShell,
    PasswordField,
    PasswordSignupFields,
    ProductLinkApproval,
    buildZdpAuthHandoffUrl,
    createZdpPasswordSignupContract,
    getAuthMessages,
    zdpAuthAvailabilityStates,
    type ZdpAuthAvailability,
    type ZdpAuthFeedback,
    type ZdpAuthMode,
    type ZdpAuthHandoffResult,
    type ZdpAuthProvider,
    type ZdpAuthSubmitDetail,
    type ZdpProductLinkRequest,
    type ZdpProductLinkTrustPolicy
  } from 'zdp-auth-ui';

  let mode: ZdpAuthMode = 'login';
  let availability: ZdpAuthAvailability = 'available';
  let locale = 'en';
  let password = '';
  let loginId = '';
  let termsAccepted = false;
  let feedback: ZdpAuthFeedback | null = null;
  let feedbackSequence = 0;
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
  const signupContractResult = createZdpPasswordSignupContract({
    termsConsentRef: 'policy://terms/2026-08-01',
    minimumAgeYears: 14,
    agePolicyRef: 'account-minimum-age-14-v1',
    locale: 'en'
  });
  if (signupContractResult.outcome !== 'created') {
    throw new Error('Clean consumer signup contract must be valid.');
  }
  const signupContract = signupContractResult.contract;

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

  function showFeedback(code: ZdpAuthFeedback['code']): void {
    feedbackSequence += 1;
    feedback = { code, sequence: feedbackSequence };
  }

  function handleSubmit(detail: ZdpAuthSubmitDetail): void {
    invalid = false;
    feedback = null;
    if (detail.mode === 'recovery') {
      showFeedback('waiting');
    }
  }
</script>

<section class="clean-consumer" aria-labelledby="clean-consumer-title">
  <h2 id="clean-consumer-title">Clean consumer fixture</h2>
  <label class="clean-consumer-availability">
    Availability
    <select bind:value={availability}>
      {#each zdpAuthAvailabilityStates as state (state)}
        <option value={state}>{state}</option>
      {/each}
    </select>
  </label>
  <AuthShell
    {locale}
    {mode}
    availability={availability}
    accountBrand="ZDP"
    {providers}
    {feedback}
    termsHref="/terms"
    privacyHref="/privacy"
    onsubmit={handleSubmit}
    onmodechange={(detail) => {
      mode = detail.mode;
      feedback = null;
    }}
    onproviderselect={() => {
      showFeedback('waiting');
    }}
  >
    {#if mode === 'signup'}
      <PasswordSignupFields
        idPrefix="clean-consumer-signup"
        contract={signupContract}
        bind:loginId
        bind:password
        bind:termsAccepted
        loginIdError={invalid ? messages.status.error : null}
        passwordError={invalid ? messages.status.error : null}
      />
    {:else}
      <PasswordField
        id="clean-consumer-password"
        name="password"
        bind:value={password}
        {locale}
        autocomplete="current-password"
        helpText="Use a password you do not use anywhere else."
        errorText={invalid ? messages.status.error : null}
        required
      />
    {/if}
  </AuthShell>

  {#if availability === 'preparing'}
    <p class="clean-consumer-gate-note" role="status">{messages.availability.preparing}</p>
  {/if}

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

  .clean-consumer-availability {
    align-items: center;
    display: flex;
    font-size: var(--zdp-type-body-small-size);
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .clean-consumer-gate-note {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-body-small-size);
    margin: 0;
  }

  .auth-handoff-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-3);
  }
</style>
