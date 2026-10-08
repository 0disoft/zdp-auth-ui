<script lang="ts">
  import { Checkbox, Link, Stack } from 'zdp-design-system';
  import { getContext } from 'svelte';
  import { getAuthMessages } from '../i18n';
  import type { ZdpPasswordSignupContract } from '../password-signup';
  import LoginIdField from './LoginIdField.svelte';
  import PasswordField from './PasswordField.svelte';
  import { termsLinkContextKey, type TermsLinkContext } from '../terms-link-context';

  export let idPrefix: string;
  export let contract: ZdpPasswordSignupContract;
  export let loginId = '';
  export let password = '';
  export let termsAccepted = false;
  export let minimumAgeConfirmed = false;
  export let disabled = false;
  export let loginIdError: string | null = null;
  export let passwordError: string | null = null;

  let confirmation = '';
  let confirmationTouched = false;
  let acceptedTermsRef = contract.termsConsentRef;
  let confirmedAgePolicyRef = contract.agePolicyRef;
  let confirmedMinimumAge = contract.minimumAgeYears;

  $: if (contract.termsConsentRef !== acceptedTermsRef) {
    termsAccepted = false;
    acceptedTermsRef = contract.termsConsentRef;
  }
  $: if (contract.agePolicyRef !== confirmedAgePolicyRef || contract.minimumAgeYears !== confirmedMinimumAge) {
    minimumAgeConfirmed = false;
    confirmedAgePolicyRef = contract.agePolicyRef;
    confirmedMinimumAge = contract.minimumAgeYears;
  }

  // Consumers clear the credential after handoff; clear its local confirmation too.
  $: if (!password) {
    confirmation = '';
    confirmationTouched = false;
  }
  $: mismatch = confirmation.length > 0 && confirmation !== password;

  function validateConfirmation(node: HTMLDivElement, message: string) {
    const input = node.querySelector('input');
    const revealError = () => { confirmationTouched = true; };
    input?.setCustomValidity(message);
    input?.addEventListener('blur', revealError);
    input?.addEventListener('invalid', revealError);
    return {
      update(nextMessage: string) { input?.setCustomValidity(nextMessage); },
      destroy() {
        input?.removeEventListener('blur', revealError);
        input?.removeEventListener('invalid', revealError);
      }
    };
  }

  $: messages = getAuthMessages(contract.locale);
  const termsHrefContext = getContext<TermsLinkContext | undefined>(termsLinkContextKey);
  $: termsHref = termsHrefContext?.() ?? null;
</script>

<Stack gap="md">
  <LoginIdField
    id={`${idPrefix}-login-id`}
    name={contract.fieldNames.loginId}
    locale={contract.locale}
    bind:value={loginId}
    errorText={loginIdError}
    {disabled}
  />
  <PasswordField
    id={`${idPrefix}-password`}
    name={contract.fieldNames.password}
    locale={contract.locale}
    autocomplete="new-password"
    bind:value={password}
    errorText={passwordError}
    required
    {disabled}
  />
  <div use:validateConfirmation={mismatch ? messages.feedback.passwordMismatch : ''}>
    <PasswordField
      id={`${idPrefix}-password-confirmation`}
      name=""
      label={messages.fields.passwordConfirmation}
      locale={contract.locale}
      autocomplete="new-password"
      bind:value={confirmation}
      errorText={confirmationTouched && mismatch ? messages.feedback.passwordMismatch : null}
      required
      {disabled}
    />
  </div>
  <div class="zdp-auth-signup-terms">
    {#key contract.termsConsentRef}
    <Checkbox
      id={`${idPrefix}-terms-accepted`}
      name={contract.fieldNames.termsAccepted}
      value="true"
      bind:checked={termsAccepted}
      required
      {disabled}
    >
      {messages.fields.termsAcceptance}
    </Checkbox>
    {/key}
    {#if termsHref}
      <Link href={termsHref} target="_blank" rel="noopener noreferrer">{messages.links.terms}</Link>
    {/if}
  </div>
  {#key JSON.stringify([contract.agePolicyRef, contract.minimumAgeYears])}
  <Checkbox
    id={`${idPrefix}-minimum-age-confirmed`}
    name={contract.fieldNames.minimumAgeConfirmed}
    value="true"
    bind:checked={minimumAgeConfirmed}
    required
    {disabled}
  >
    {messages.fields.minimumAgeConfirmation.replace('{minimumAge}', String(contract.minimumAgeYears))}
  </Checkbox>
  {/key}
  <input type="hidden" name={contract.fieldNames.agePolicyRef} value={contract.agePolicyRef} autocomplete="off" />
  <input
    type="hidden"
    name={contract.fieldNames.termsConsentRef}
    value={contract.termsConsentRef}
    autocomplete="off"
  />
  <input
    type="hidden"
    name={contract.fieldNames.locale}
    value={contract.locale}
    autocomplete="off"
  />
</Stack>

<style>
  .zdp-auth-signup-terms {
    align-items: start;
    display: grid;
    gap: var(--zdp-space-3);
    grid-template-columns: minmax(0, 1fr) auto;
    min-width: 0;
  }

  .zdp-auth-signup-terms :global(.zdp-link) {
    line-height: var(--zdp-type-body-small-line-height);
    white-space: nowrap;
  }

  .zdp-auth-signup-terms :global(.zdp-choice__mark) {
    margin-block-start: calc(
      (var(--zdp-type-body-small-size) * var(--zdp-type-body-small-line-height) - var(--zdp-control-choice-size)) / 2
    );
  }

  @media (max-width: 30rem) {
    .zdp-auth-signup-terms {
      grid-template-columns: minmax(0, 1fr);
    }

    .zdp-auth-signup-terms :global(.zdp-link) {
      margin-inline-start: calc(var(--zdp-control-choice-size) + var(--zdp-space-3));
    }
  }
</style>
