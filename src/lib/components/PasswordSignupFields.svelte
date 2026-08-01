<script lang="ts">
  import { Checkbox, Stack } from 'zdp-design-system';
  import { getAuthMessages } from '../i18n';
  import type { ZdpPasswordSignupContract } from '../password-signup';
  import LoginIdField from './LoginIdField.svelte';
  import PasswordField from './PasswordField.svelte';

  export let idPrefix: string;
  export let contract: ZdpPasswordSignupContract;
  export let loginId = '';
  export let password = '';
  export let termsAccepted = false;
  export let disabled = false;
  export let loginIdError: string | null = null;
  export let passwordError: string | null = null;

  $: messages = getAuthMessages(contract.locale);
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
