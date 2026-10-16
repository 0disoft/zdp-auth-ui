<script lang="ts">
  import { ErrorText, Field, HelpText, Input, Label } from 'zdp-design-system';
  import type { ZdpAuthMessages, ZdpAuthLocale } from '../i18n';

  // Keep locale accepted for compatibility; injected messages select the copy.

  interface Props {
    messages: ZdpAuthMessages;
    id: string;
    name?: string;
    label?: string | null;
    value?: string;
    locale?: ZdpAuthLocale | string;
    autocomplete?: 'username' | 'username webauthn';
    describedBy?: string | readonly string[] | null;
    helpText?: string | null;
    errorText?: string | null;
    required?: boolean;
    disabled?: boolean;
  }

  let {
    messages,
    id,
    name = 'login_id',
    label = null,
    value = $bindable(''),
    locale = 'en',
    autocomplete = 'username',
    describedBy = null,
    helpText = null,
    errorText = null,
    required = true,
    disabled = false
  }: Props = $props();

  let copy = $derived(messages);
  let labelText = $derived(label ?? copy.fields.loginId);
  let helpId = $derived(helpText && !errorText ? `${id}-help` : null);
  let errorId = $derived(errorText ? `${id}-error` : null);
  let describedByIds = $derived([describedBy, helpId, errorId].flat().filter(Boolean) as string[]);
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
