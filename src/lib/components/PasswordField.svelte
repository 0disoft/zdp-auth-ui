<script lang="ts">
  import { Button, ErrorText, Field, HelpText, Input, Label } from 'zdp-design-system';
  import { getAuthMessages, type ZdpAuthLocale } from '../i18n';

  export let id: string;
  export let name: string;
  export let label: string | null = null;
  export let value = '';
  export let locale: ZdpAuthLocale | string = 'en';
  export let autocomplete: 'current-password' | 'new-password' = 'current-password';
  export let describedBy: string | readonly string[] | null = null;
  export let helpText: string | null = null;
  export let errorText: string | null = null;
  export let required = false;
  export let disabled = false;

  let visible = false;

  $: messages = getAuthMessages(locale);
  $: labelText = label ?? messages.fields.password;
  $: helpId = helpText ? `${id}-help` : null;
  $: errorId = errorText ? `${id}-error` : null;
  $: describedByIds = [describedBy, helpId, errorId].flat().filter(Boolean) as string[];
  $: toggleLabel = visible ? messages.actions.hidePassword : messages.actions.showPassword;
</script>

<Field required={required} invalid={Boolean(errorText)}>
  <Label forId={id}>{labelText}</Label>
  <div class="zdp-auth-password-field__control">
    <Input
      {id}
      {name}
      type={visible ? 'text' : 'password'}
      bind:value
      {autocomplete}
      describedBy={describedByIds}
      errorMessageId={errorId}
      invalid={Boolean(errorText)}
      {required}
      {disabled}
    />
    <Button
      variant="secondary"
      size="sm"
      type="button"
      disabled={disabled}
      ariaPressed={visible}
      onclick={() => (visible = !visible)}
    >
      {toggleLabel}
    </Button>
  </div>
  {#if helpText && helpId}
    <HelpText id={helpId}>{helpText}</HelpText>
  {/if}
  {#if errorText && errorId}
    <ErrorText id={errorId}>{errorText}</ErrorText>
  {/if}
</Field>

<style>
  .zdp-auth-password-field__control {
    align-items: stretch;
    display: grid;
    gap: var(--zdp-space-2);
    grid-template-columns: minmax(0, 1fr) auto;
  }

  @media (max-width: 40rem) {
    .zdp-auth-password-field__control {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>

