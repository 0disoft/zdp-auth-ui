<script lang="ts">
  import {
    ErrorText,
    Field,
    HelpText,
    IconButton,
    Input,
    Label
  } from 'zdp-design-system';
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
    <IconButton
      variant="ghost"
      size="sm"
      type="button"
      disabled={disabled}
      ariaPressed={visible}
      ariaLabel={toggleLabel}
      onclick={() => (visible = !visible)}
    >
      {#if visible}
        <svg
          class="zdp-auth-password-field__toggle-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M3 12s3.25-6 9-6 9 6 9 6-3.25 6-9 6-9-6-9-6Z"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
          <path
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
          <path
            d="M4 4l16 16"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2"
          />
        </svg>
      {:else}
        <svg
          class="zdp-auth-password-field__toggle-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M3 12s3.25-6 9-6 9 6 9 6-3.25 6-9 6-9-6-9-6Z"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
          <path
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
      {/if}
    </IconButton>
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

  .zdp-auth-password-field__toggle-icon {
    display: block;
    height: 100%;
    width: 100%;
  }
</style>
