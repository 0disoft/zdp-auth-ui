<script lang="ts">
  import { ErrorText, Field, HelpText, Input, Label } from 'zdp-design-system';
  import { getAuthMessages, type ZdpAuthLocale } from '../i18n';

  export let id: string;
  export let name = 'login_id';
  export let label: string | null = null;
  export let value = '';
  export let locale: ZdpAuthLocale | string = 'en';
  export let autocomplete: 'username' | 'username webauthn' = 'username';
  export let describedBy: string | readonly string[] | null = null;
  export let helpText: string | null = null;
  export let errorText: string | null = null;
  export let required = true;
  export let disabled = false;

  $: messages = getAuthMessages(locale);
  $: labelText = label ?? messages.fields.loginId;
  $: helpId = helpText ? `${id}-help` : null;
  $: errorId = errorText ? `${id}-error` : null;
  $: describedByIds = [describedBy, helpId, errorId].flat().filter(Boolean) as string[];
</script>

<Field required={required} invalid={Boolean(errorText)}>
  <Label forId={id}>{labelText}</Label>
  <Input
    {id}
    {name}
    type="text"
    bind:value
    {autocomplete}
    describedBy={describedByIds}
    errorMessageId={errorId}
    invalid={Boolean(errorText)}
    {required}
    {disabled}
  />
  {#if helpText && helpId}
    <HelpText id={helpId}>{helpText}</HelpText>
  {/if}
  {#if errorText && errorId}
    <ErrorText id={errorId}>{errorText}</ErrorText>
  {/if}
</Field>
