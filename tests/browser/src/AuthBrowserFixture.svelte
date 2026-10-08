<script lang="ts">
  import AuthShell from '../../../src/lib/components/AuthShell.svelte';
  import LoginIdField from '../../../src/lib/components/LoginIdField.svelte';
  import PasswordField from '../../../src/lib/components/PasswordField.svelte';
  import PasswordSignupFields from '../../../src/lib/components/PasswordSignupFields.svelte';
  import ProductLinkApproval from '../../../src/lib/components/ProductLinkApproval.svelte';
  import DistAuthShellFixture from './DistAuthShellFixture.svelte';
  import {
    buildZdpAuthHandoffUrl,
    type ZdpAuthHandoffResult
  } from '../../../src/lib/auth-handoff';
  import type {
    ZdpProductLinkDecisionDetail,
    ZdpProductLinkRequest,
    ZdpProductLinkState,
    ZdpProductLinkTrustPolicy
  } from '../../../src/lib/product-link';
  import { createZdpPasswordSignupContract } from '../../../src/lib/password-signup';

  let password = '';
  let resetPassword = 'initial-fixture-password';
  let cancelPasswordReset = false;
  let submitCount = 0;
  let preparingSubmitCount = 0;
  let preparingPassword = '';
  let signupSubmitCount = 0;
  let signupLoginId = '';
  let signupPassword = '';
  let signupTermsAccepted = false;
  let resetTermsAccepted = true;
  let resetAgeConfirmed = true;
  let signupSubmittedFields = '';
  let approveRequest = createProductLinkRequest('plc_approve_fixture_0123456789');
  let denyRequest = createProductLinkRequest('plc_deny_fixture_012345678901');
  let approveBusy = false;
  let denyBusy = false;
  let completionCount = 0;
  let clockShiftDecisionCount = 0;
  let replacementRequest = createProductLinkRequest('plc_replacement_fixture_012345');
  let replacementDecisionCount = 0;

  function replaceProductLinkRequest(): void {
    const issuedAt = new Date();
    replacementRequest = {
      ...createProductLinkRequest('plc_replacement_fixture_new'),
      issuedAt: issuedAt.toISOString(),
      expiresAt: new Date(issuedAt.getTime() + 600_000).toISOString()
    };
  }

  const fixtureNow = new Date('2026-07-15T04:05:00.000Z');
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
  const rejectedHandoff: ZdpAuthHandoffResult = buildZdpAuthHandoffUrl({
    mode: 'login',
    productId: 'melamed',
    trustedAuthOrigin: 'https://accounts.zdp.example',
    returnPath: '//untrusted.example/apply'
  });
  const signupContractResult = createZdpPasswordSignupContract({
    termsConsentRef: 'policy://terms/2026-08-01',
    minimumAgeYears: 14,
    agePolicyRef: 'account-minimum-age-14-v1',
    locale: 'en'
  });
  if (signupContractResult.outcome !== 'created') {
    throw new Error('Browser signup fixture contract must be valid.');
  }
  let signupContract = signupContractResult.contract;

  function createProductLinkRequest(challengeRef: string): ZdpProductLinkRequest {
    return {
      challengeRef,
      verificationUri: `https://accounts.zdp.example/auth/product-link?challenge=${challengeRef}`,
      state: 'pending',
      productLabel: 'Talos Desktop',
      requestedItems: [
        {
          ref: 'workspace_read_012345',
          kind: 'scope',
          label: 'Workspace identity',
          description: 'Use the selected workspace reference for this connection.'
        },
        {
          ref: 'remote_features_012345',
          kind: 'capability',
          label: 'Remote account features',
          description: 'Enable account-backed features after the connection completes.'
        }
      ],
      accountLabel: 'Signed-in ZDP account',
      workspaceLabel: 'Personal workspace',
      consentImplications: [
        'The product receives opaque account and consent references.',
        'Product data stays local unless you approve a separate sync flow.'
      ],
      issuedAt: '2026-07-15T04:04:00.000Z',
      expiresAt: '2026-07-15T04:14:00.000Z'
    };
  }

  function createTrust(challengeRef: string): ZdpProductLinkTrustPolicy {
    return {
      expectedChallengeRef: challengeRef,
      expectedVerificationUri: `https://accounts.zdp.example/auth/product-link?challenge=${challengeRef}`,
      allowedVerificationOrigins: ['https://accounts.zdp.example'],
      verificationPath: '/auth/product-link',
      maxRequestAgeMs: 120_000
    };
  }

  const fakeApi = {
    async complete(detail: ZdpProductLinkDecisionDetail): Promise<ZdpProductLinkState> {
      completionCount += 1;
      await Promise.resolve();
      return detail.decision === 'approve' ? 'approved' : 'denied';
    }
  };

  async function handleApprove(detail: ZdpProductLinkDecisionDetail): Promise<void> {
    approveBusy = true;
    const state = await fakeApi.complete(detail);
    approveRequest = { ...approveRequest, state };
    approveBusy = false;
  }

  async function handleDeny(detail: ZdpProductLinkDecisionDetail): Promise<void> {
    denyBusy = true;
    const state = await fakeApi.complete(detail);
    denyRequest = { ...denyRequest, state };
    denyBusy = false;
  }
</script>

<main>
  <form data-testid="password-reset-fixture" onreset={(event) => { if (cancelPasswordReset) event.preventDefault(); }}>
    <PasswordField id="reset-password" name="password" bind:value={resetPassword} locale="en" />
    <button type="reset">Reset password field</button>
    <button type="button" onclick={() => resetPassword = ''}>Clear password field</button>
    <button type="button" onclick={() => cancelPasswordReset = true}>Cancel password resets</button>
  </form>
  <section data-testid="login-fixture">
    <AuthShell
      locale="en"
      mode="login"
      onsubmit={() => {
        submitCount += 1;
      }}
    >
      <PasswordField
        id="browser-password"
        name="password"
        bind:value={password}
        locale="en"
        autocomplete="current-password"
        required
      />
    </AuthShell>
  </section>
  <output data-testid="submit-count">{submitCount}</output>

  <section data-testid="recovery-link-fixture">
    <AuthShell locale="en" mode="login" recoveryHref="/recovery">
      <PasswordField
        id="browser-recovery-link-password"
        name="password"
        bind:value={password}
        locale="en"
        autocomplete="current-password"
      />
    </AuthShell>
  </section>

  <section data-testid="japanese-login-fixture">
    <AuthShell locale="ja" mode="login" accountBrand="ZDP">
      <LoginIdField id="browser-ja-login-id" locale="ja" />
      <PasswordField id="browser-ja-password" name="password" locale="ja" />
    </AuthShell>
  </section>

  <section data-testid="unsafe-account-brand-fixture">
    <AuthShell locale="en" mode="login" availability="preparing" accountBrand={'ZDP\u202e'} />
  </section>

  <DistAuthShellFixture />

  <section data-testid="auth-preparing-fixture">
    <AuthShell
      locale="en"
      mode="login"
      availability="preparing"
      onsubmit={() => {
        preparingSubmitCount += 1;
      }}
    >
      <PasswordField
        id="browser-preparing-password"
        name="password"
        bind:value={preparingPassword}
        locale="en"
        autocomplete="current-password"
        required
      />
    </AuthShell>
  </section>
  <output data-testid="preparing-submit-count">{preparingSubmitCount}</output>

  <section data-testid="preparing-signup-policy-fixture">
    <AuthShell
      locale="en"
      mode="signup"
      availability="preparing"
      termsHref="/terms"
      privacyHref="/privacy"
    />
  </section>

  <section data-testid="preparing-signup-fields-fixture">
    <AuthShell
      locale="en"
      mode="signup"
      availability="preparing"
      termsHref="/terms"
      signupTermsInSlot
    >
      <PasswordSignupFields idPrefix="browser-preparing-signup" contract={signupContract} />
    </AuthShell>
  </section>

  <section data-testid="signup-fixture">
    <AuthShell
      locale="en"
      mode="signup"
      termsHref="/terms"
      privacyHref="/privacy"
      onsubmit={({ form }) => {
        signupSubmitCount += 1;
        const data = new FormData(form);
        signupSubmittedFields = [
          data.get('login_id'),
          data.has('password') ? 'password-present' : 'password-missing',
          data.get('minimum_age_confirmed'),
          data.get('age_policy_ref'),
          data.get('terms_accepted'),
          data.get('terms_consent_ref'),
          data.get('locale')
        ].join('|');
        signupPassword = '';
      }}
    >
      <PasswordSignupFields
        idPrefix="browser-signup"
        contract={signupContract}
        bind:loginId={signupLoginId}
        bind:password={signupPassword}
        bind:termsAccepted={signupTermsAccepted}
      />
    </AuthShell>
  </section>
  <output data-testid="signup-submit-count">{signupSubmitCount}</output>
  <output data-testid="signup-submitted-fields">{signupSubmittedFields}</output>
  <button type="button" data-testid="change-signup-terms" onclick={() => signupContract = { ...signupContract, termsConsentRef: 'policy://terms/2026-10-08' }}>Change terms</button>
  <button type="button" data-testid="change-signup-age-policy" onclick={() => signupContract = { ...signupContract, agePolicyRef: 'account-minimum-age-14-v2' }}>Change age policy</button>
  <button type="button" data-testid="change-signup-minimum-age" onclick={() => signupContract = { ...signupContract, minimumAgeYears: 18 }}>Change minimum age</button>
  <button type="button" data-testid="replace-signup-contract" onclick={() => signupContract = { ...signupContract }}>Replace equivalent contract</button>
  <form data-testid="signup-policy-reset">
    <PasswordSignupFields idPrefix="reset-signup" contract={signupContract}
      bind:termsAccepted={resetTermsAccepted} bind:minimumAgeConfirmed={resetAgeConfirmed} />
    <button type="reset">Reset signup confirmation</button>
  </form>

  <nav data-testid="auth-handoff-fixture" aria-label="Melamed account access">
    {#if loginHandoff.outcome === 'created'}
      <a data-testid="melamed-login-handoff" href={loginHandoff.url}>Log in for Melamed</a>
    {/if}
    {#if signupHandoff.outcome === 'created'}
      <a data-testid="melamed-signup-handoff" href={signupHandoff.url}>Sign up for Melamed</a>
    {/if}
    {#if rejectedHandoff.outcome === 'created'}
      <a data-testid="rejected-auth-handoff" href={rejectedHandoff.url}>Unsafe handoff</a>
    {/if}
  </nav>

  <section data-testid="product-link-approve">
    <ProductLinkApproval
      id="product-link-approve"
      enabled
      locale="en"
      request={approveRequest}
      trust={createTrust(approveRequest.challengeRef)}
      now={fixtureNow}
      busy={approveBusy}
      ondecision={handleApprove}
    />
  </section>

  <section data-testid="product-link-deny">
    <ProductLinkApproval
      id="product-link-deny"
      enabled
      locale="en"
      request={denyRequest}
      trust={createTrust(denyRequest.challengeRef)}
      now={fixtureNow}
      busy={denyBusy}
      ondecision={handleDeny}
    />
  </section>

  <section data-testid="product-link-clock-shift">
    <ProductLinkApproval
      id="product-link-clock-shift"
      enabled
      locale="en"
      request={createProductLinkRequest('plc_clock_shift_fixture_012345')}
      trust={createTrust('plc_clock_shift_fixture_012345')}
      ondecision={() => { clockShiftDecisionCount += 1; }}
    />
    <output data-testid="clock-shift-decision-count">{clockShiftDecisionCount}</output>
  </section>

  <section data-testid="product-link-replacement">
    <ProductLinkApproval
      id="product-link-replacement" enabled locale="en"
      request={replacementRequest} trust={createTrust(replacementRequest.challengeRef)}
      ondecision={() => { replacementDecisionCount += 1; }}
    />
    <button type="button" onclick={replaceProductLinkRequest}>Refresh link request</button>
    <output data-testid="replacement-decision-count">{replacementDecisionCount}</output>
  </section>

  <section data-testid="product-link-unsafe">
    <ProductLinkApproval
      id="product-link-unsafe"
      enabled
      locale="en"
      request={{
        ...createProductLinkRequest('plc_unsafe_fixture_012345678'),
        verificationUri: 'https://accounts.zdp.example/auth/product-link?challenge=plc_unsafe_fixture_012345678&redirect=https%3A%2F%2Funtrusted.example'
      }}
      trust={createTrust('plc_unsafe_fixture_012345678')}
      now={fixtureNow}
    />
  </section>

  <section data-testid="product-link-stale">
    <ProductLinkApproval
      id="product-link-stale"
      enabled
      locale="en"
      request={{
        ...createProductLinkRequest('plc_stale_fixture_0123456789'),
        issuedAt: '2026-07-15T04:00:00.000Z',
        expiresAt: '2026-07-15T04:10:00.000Z'
      }}
      trust={createTrust('plc_stale_fixture_0123456789')}
      now={fixtureNow}
    />
  </section>

  <section data-testid="product-link-expired">
    <ProductLinkApproval
      id="product-link-expired"
      enabled
      locale="en"
      request={{
        ...createProductLinkRequest('plc_expired_fixture_01234567'),
        state: 'expired'
      }}
      trust={createTrust('plc_expired_fixture_01234567')}
      now={fixtureNow}
    />
  </section>

  <section data-testid="product-link-consumed">
    <ProductLinkApproval
      id="product-link-consumed"
      enabled
      locale="en"
      request={{
        ...createProductLinkRequest('plc_consumed_fixture_0123456'),
        state: 'consumed'
      }}
      trust={createTrust('plc_consumed_fixture_0123456')}
      now={fixtureNow}
    />
  </section>

  <section data-testid="product-link-disabled">
    <ProductLinkApproval
      id="product-link-disabled"
      locale="en"
      request={createProductLinkRequest('plc_disabled_fixture_0123456')}
      trust={createTrust('plc_disabled_fixture_0123456')}
      now={fixtureNow}
    />
  </section>

  <output data-testid="completion-count">{completionCount}</output>
</main>
