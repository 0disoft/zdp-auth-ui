<script lang="ts">
  import {
    Button,
    Divider,
    Inline,
    Link,
    Stack,
    Surface
  } from 'zdp-design-system';
  import { setContext } from 'svelte';
  import type {
    ZdpAuthAvailability,
    ZdpAuthMode,
    ZdpAuthModeChangeDetail,
    ZdpAuthProvider,
    ZdpAuthProviderSelectDetail,
    ZdpAuthSubmitDetail
  } from '../auth-contract';
  import { getAuthMessages, type ZdpAuthLocale } from '../i18n';
  import ProviderButton from './ProviderButton.svelte';
  import { termsLinkContextKey, type TermsLinkContext } from '../terms-link-context';

  export let locale: ZdpAuthLocale | string = 'en';
  export let mode: ZdpAuthMode = 'login';
  export let availability: ZdpAuthAvailability = 'available';
  export let accountBrand: string | null = null;
  export let providers: readonly ZdpAuthProvider[] = [];
  export let action: string | null = null;
  export let method: 'post' = 'post';
  export let status: string | null = null;
  export let invalid = false;
  export let referralCode: string | null = null;
  export let referralCodeFieldName = 'referral_code';
  export let recoveryHref: string | null = null;
  export let termsHref: string | null = null;
  export let privacyHref: string | null = null;
  export let onsubmit: ((detail: ZdpAuthSubmitDetail, event: SubmitEvent) => void) | null = null;
  export let onproviderselect: ((detail: ZdpAuthProviderSelectDetail, event: MouseEvent) => void) | null = null;
  export let onmodechange: ((detail: ZdpAuthModeChangeDetail, event: MouseEvent) => void) | null = null;

  $: messages = getAuthMessages(locale);
  $: normalizedAccountBrand = normalizeAccountBrand(accountBrand);
  $: title = messages.title[mode];
  $: summary = messages.summary[mode].replace(messages.brand, normalizedAccountBrand ?? messages.brand);
  $: primaryAction = messages.actions[mode];
  $: preparing = availability === 'preparing';
  $: nextMode = getNextMode(mode);
  $: nextModeLabel = mode === 'login' ? messages.links.signup : messages.links.login;
  $: formMethod = getFormMethod(method);
  $: normalizedReferralCode = normalizeOptionalFormValue(referralCode);
  $: normalizedReferralCodeFieldName = normalizeOptionalFormValue(referralCodeFieldName) ?? 'referral_code';
  $: normalizedRecoveryHref = normalizeOptionalFormValue(recoveryHref);
  setContext<TermsLinkContext>(termsLinkContextKey, () => termsHref?.trim() || null);

  function handleSubmit(event: SubmitEvent): void {
    const form = event.currentTarget as HTMLFormElement;
    if (preparing || onsubmit || !action) {
      event.preventDefault();
    }
    if (preparing) {
      return;
    }
    onsubmit?.({ mode, form, referralCode: normalizedReferralCode }, event);
  }

  function handleProviderSelect(provider: ZdpAuthProvider, event: MouseEvent): void {
    onproviderselect?.({ provider }, event);
  }

  function handleModeChange(event: MouseEvent): void {
    onmodechange?.({ mode: nextMode }, event);
  }

  function getNextMode(currentMode: ZdpAuthMode): ZdpAuthMode {
    return currentMode === 'login' ? 'signup' : 'login';
  }

  function getFormMethod(_method: 'post'): 'post' {
    return 'post';
  }

  function normalizeOptionalFormValue(value: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  function normalizeAccountBrand(value: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed && [...trimmed].length <= 64 && !/[\p{C}\p{Zl}\p{Zp}]/u.test(trimmed)
      ? trimmed
      : null;
  }
</script>

<Surface padding="lg">
  <form
    class="zdp-auth-shell"
    action={action ?? undefined}
    method={formMethod}
    data-mode={mode}
    data-availability={availability}
    onsubmit={handleSubmit}
  >
    <Stack gap="md">
      <header class="zdp-auth-shell__header">
        <h1>{title}</h1>
        <p class="zdp-auth-shell__summary">{summary}</p>
      </header>

      {#if providers.length > 0}
        <div class="zdp-auth-shell__providers" role="group" aria-label={messages.providers.groupLabel}>
          {#each providers as provider (provider.id)}
            <ProviderButton {provider} disabled={preparing} onclick={handleProviderSelect} />
          {/each}
        </div>
        <Divider />
      {/if}

      <slot />

      {#if mode === 'signup' && normalizedReferralCode}
        <input
          type="hidden"
          name={normalizedReferralCodeFieldName}
          value={normalizedReferralCode}
          autocomplete="off"
        />
      {/if}

      {#if status}
        <p class="zdp-auth-shell__status" role={invalid ? 'alert' : 'status'} aria-live={invalid ? 'assertive' : 'polite'}>{status}</p>
      {/if}

      {#if preparing}
        <p class="zdp-auth-shell__notice" role="status">{messages.availability.preparing}</p>
      {/if}

      <Inline gap="sm" align="stretch" justify="between">
        <Button type="submit" disabled={preparing}>{primaryAction}</Button>
        {#if mode !== 'recovery' && !preparing}
          <Button type="button" variant="secondary" onclick={handleModeChange}>{nextModeLabel}</Button>
        {/if}
      </Inline>

      <nav class="zdp-auth-shell__links" aria-label={messages.navigation.accountHelp}>
        {#if mode === 'login' && normalizedRecoveryHref && !preparing}
          <Link href={normalizedRecoveryHref}>{messages.links.recovery}</Link>
        {/if}
        {#if termsHref && (mode !== 'signup' || preparing)}
          <Link href={termsHref} target="_blank" rel="noopener noreferrer">{messages.links.terms}</Link>
        {/if}
        {#if privacyHref}
          <Link href={privacyHref}>{messages.links.privacy}</Link>
        {/if}
      </nav>
    </Stack>
  </form>
</Surface>

<style>
  .zdp-auth-shell {
    --zdp-type-body-small-size: var(--zdp-font-size-md);
    --zdp-type-control-size: var(--zdp-font-size-md);
    --zdp-type-label-size: var(--zdp-font-size-sm);

    color: var(--zdp-color-ink-normal);
    min-width: 0;
    text-wrap: var(--zdp-i18n-text-wrap);
    word-break: var(--zdp-i18n-word-break);
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-auth-shell__header {
    display: grid;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-auth-shell__header h1,
  .zdp-auth-shell__header p,
  .zdp-auth-shell__summary {
    margin: 0;
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-auth-shell__header h1 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-page-title-compact-size);
    line-height: var(--zdp-font-line-height-tight);
  }

  .zdp-auth-shell__summary {
    font-size: var(--zdp-type-body-size);
    line-height: var(--zdp-type-body-line-height);
  }

  .zdp-auth-shell__providers {
    display: grid;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-auth-shell__status {
    color: var(--zdp-color-accent-danger);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
    margin: 0;
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-auth-shell__notice {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
    margin: 0;
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-auth-shell__links {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-3);
    min-width: 0;
  }
</style>
