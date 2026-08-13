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
  export let disabled = false;
  export let loginIdError: string | null = null;
  export let passwordError: string | null = null;

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
  <div class="zdp-auth-signup-terms">
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
    {#if termsHref}
      <Link href={termsHref} target="_blank" rel="noopener noreferrer">{messages.links.terms}</Link>
    {/if}
  </div>
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

  @media (max-width: 24rem) {
    .zdp-auth-signup-terms {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
