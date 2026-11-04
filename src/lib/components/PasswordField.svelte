<script lang="ts">
  import {
    ErrorText,
    Field,
    HelpText,
    IconButton,
    Input,
    Label
  } from 'zdp-design-system';
  import type { ZdpAuthMessages, ZdpAuthLocale } from '../i18n';
  import { onInputFormReset } from '../form-reset';
  import SquareAsterisk from 'lucide-svelte/icons/square-asterisk';
  import CaseSensitive from 'lucide-svelte/icons/case-sensitive';

  // Keep locale accepted for compatibility; injected messages select the copy.

  interface Props {
    messages: ZdpAuthMessages;
    id: string;
    name: string;
    label?: string | null;
    value?: string;
    locale?: ZdpAuthLocale | string;
    autocomplete?: 'current-password' | 'new-password';
    describedBy?: string | readonly string[] | null;
    helpText?: string | null;
    errorText?: string | null;
    required?: boolean;
    disabled?: boolean;
  }

  let {
    messages,
    id,
    name,
    label = null,
    value = $bindable(''),
    locale = 'en',
    autocomplete = 'current-password',
    describedBy = null,
    helpText = null,
    errorText = null,
    required = false,
    disabled = false
  }: Props = $props();

  let visible = $state(false);
  $effect.pre(() => {
    if (value === '') visible = false;
  });

  function hideOnFormReset(node: HTMLDivElement) {
    const input = node.querySelector('input');
    if (!input) return;
    return { destroy: onInputFormReset(input, () => { visible = false; }) };
  }

  let copy = $derived(messages);
  let labelText = $derived(label ?? copy.fields.password);
  let helpId = $derived(helpText && !errorText ? `${id}-help` : null);
  let errorId = $derived(errorText ? `${id}-error` : null);
  let describedByIds = $derived([describedBy, helpId, errorId].flat().filter(Boolean) as string[]);
  let toggleLabel = $derived(visible ? copy.actions.hidePassword : copy.actions.showPassword);
</script>

<Field required={required} invalid={Boolean(errorText)}>
  <Label forId={id}>{labelText}</Label>
  <div class="zdp-auth-password-field__control" use:hideOnFormReset>
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
      size="md"
      type="button"
      disabled={disabled}
      ariaPressed={visible}
      ariaControls={id}
      ariaLabel={toggleLabel}
      title={toggleLabel}
      onclick={() => (visible = !visible)}
    >
      {#if visible}
        <CaseSensitive
          class="zdp-auth-password-field__toggle-icon"
          aria-hidden="true"
          focusable="false"
        />
      {:else}
        <SquareAsterisk
          class="zdp-auth-password-field__toggle-icon"
          aria-hidden="true"
          focusable="false"
        />
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
    position: relative;
    min-inline-size: 0;
  }

  .zdp-auth-password-field__control :global(.zdp-input) {
    padding-inline-end: calc(var(--zdp-control-icon-md) + var(--zdp-space-3));
  }

  .zdp-auth-password-field__control :global(.zdp-icon-button) {
    position: absolute;
    inset-block: 0;
    inset-inline-end: 0;
    block-size: 100%;
    min-block-size: var(--zdp-control-height-md);
  }

  .zdp-auth-password-field__control :global(.zdp-auth-password-field__toggle-icon) {
    display: block;
    opacity: 0.85;
    height: var(--zdp-control-glyph-md);
    width: var(--zdp-control-glyph-md);
  }
</style>
