<script lang="ts">
  import {
    Button,
    Divider,
    Inline,
    Link,
    Stack,
    Surface
  } from 'zdp-design-system';
  import { onMount, setContext, tick } from 'svelte';
  import { writable } from 'svelte/store';
  import {
    isZdpAuthFeedbackCode,
    isZdpAuthFeedbackErrorCode,
    type ZdpAuthAvailability,
    type ZdpAuthFeedback,
    type ZdpAuthFeedbackCode,
    type ZdpAuthMode,
    type ZdpAuthModeChangeDetail,
    type ZdpAuthProvider,
    type ZdpAuthProviderSelectDetail,
    type ZdpAuthSubmitDetail
  } from '../auth-contract';
  import { getAuthMessages, type ZdpAuthLocale, type ZdpAuthMessages } from '../i18n';
  import ProviderButton from './ProviderButton.svelte';
  import { termsLinkContextKey, type TermsLinkContext } from '../terms-link-context';

  interface AuthFeedbackPresentation {
    readonly code: ZdpAuthFeedbackCode;
    readonly message: string;
    readonly invalid: boolean;
  }

  export let locale: ZdpAuthLocale | string = 'en';
  export let mode: ZdpAuthMode = 'login';
  export let availability: ZdpAuthAvailability = 'available';
  export let busy = false;
  export let accountBrand: string | null = null;
  export let providers: readonly ZdpAuthProvider[] = [];
  export let action: string | null = null;
  export let method: 'post' = 'post';
  export let feedback: ZdpAuthFeedback | null = null;
  export let status: string | null = null;
  export let invalid = false;
  export let referralCode: string | null = null;
  export let referralCodeFieldName = 'referral_code';
  export let recoveryHref: string | null = null;
  export let termsHref: string | null = null;
  export let signupTermsInSlot = false;
  export let privacyHref: string | null = null;
  export let onsubmit: ((detail: ZdpAuthSubmitDetail, event: SubmitEvent) => void) | null = null;
  export let onproviderselect: ((detail: ZdpAuthProviderSelectDetail, event: MouseEvent) => void) | null = null;
  export let onmodechange: ((detail: ZdpAuthModeChangeDetail, event: MouseEvent) => void) | null = null;

  let mounted = false;
  let feedbackElement: HTMLParagraphElement | null = null;
  let previousFeedbackKey: string | null = null;
  let previousLegacyErrorKey: string | null = null;
  let pendingFocusKey: string | null = null;
  let sameTaskSubmitHandled = false;

  $: messages = getAuthMessages(locale);
  $: normalizedAccountBrand = normalizeAccountBrand(accountBrand);
  $: title = messages.title[mode];
  $: summary = messages.summary[mode].replace(messages.brand, normalizedAccountBrand ?? messages.brand);
  $: primaryAction = messages.actions[mode];
  $: preparing = availability === 'preparing';
  $: submitting = busy && !preparing;
  $: interactionLocked = preparing || submitting;
  $: nextMode = getNextMode(mode);
  $: nextModeLabel = mode === 'login' ? messages.links.signup : messages.links.login;
  $: formMethod = getFormMethod(method);
  $: normalizedReferralCode = normalizeOptionalFormValue(referralCode);
  $: normalizedReferralCodeFieldName = normalizeOptionalFormValue(referralCodeFieldName) ?? 'referral_code';
  $: normalizedRecoveryHref = normalizeOptionalFormValue(recoveryHref);
  $: typedFeedback = resolveTypedFeedback(feedback, messages, mode);
  $: feedbackKey = getFeedbackKey(feedback);
  $: legacyErrorKey = invalid && status ? status : null;
  $: visibleErrorKey = typedFeedback
    ? (typedFeedback.invalid && feedbackKey ? `typed:${feedbackKey}` : null)
    : (legacyErrorKey ? `legacy:${legacyErrorKey}` : null);
  $: if (mounted && feedbackKey !== previousFeedbackKey) {
    previousFeedbackKey = feedbackKey;
    pendingFocusKey = typedFeedback?.invalid && feedbackKey ? `typed:${feedbackKey}` : null;
  }
  $: if (mounted && legacyErrorKey !== previousLegacyErrorKey) {
    previousLegacyErrorKey = legacyErrorKey;
    if (!typedFeedback) pendingFocusKey = legacyErrorKey ? `legacy:${legacyErrorKey}` : null;
  }
  $: if (mounted && !submitting && pendingFocusKey && pendingFocusKey === visibleErrorKey) {
    void focusFeedback(pendingFocusKey);
  }
  const termsLinkContext = writable(termsHref?.trim() || null);
  setContext<TermsLinkContext>(termsLinkContextKey, termsLinkContext);
  $: termsLinkContext.set(termsHref?.trim() || null);

  onMount(() => {
    previousFeedbackKey = feedbackKey;
    previousLegacyErrorKey = legacyErrorKey;
    mounted = true;
  });

  function handleSubmit(event: SubmitEvent): void {
    const form = event.currentTarget as HTMLFormElement;
    if (interactionLocked || sameTaskSubmitHandled || onsubmit || !action) {
      event.preventDefault();
    }
    if (interactionLocked || sameTaskSubmitHandled) {
      return;
    }
    sameTaskSubmitHandled = true;
    queueMicrotask(() => { sameTaskSubmitHandled = false; });
    onsubmit?.({ mode, form, referralCode: normalizedReferralCode }, event);
  }

  function handleProviderSelect(provider: ZdpAuthProvider, event: MouseEvent): void {
    if (interactionLocked || sameTaskSubmitHandled || provider.disabled) {
      return;
    }
    sameTaskSubmitHandled = true;
    queueMicrotask(() => { sameTaskSubmitHandled = false; });
    onproviderselect?.({ provider }, event);
  }

  function handleModeChange(event: MouseEvent): void {
    if (interactionLocked || sameTaskSubmitHandled) {
      return;
    }
    sameTaskSubmitHandled = true;
    queueMicrotask(() => { sameTaskSubmitHandled = false; });
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

  function resolveTypedFeedback(
    value: ZdpAuthFeedback | null,
    catalog: ZdpAuthMessages,
    currentMode: ZdpAuthMode
  ): AuthFeedbackPresentation | null {
    if (!value || !isZdpAuthFeedbackCode(value.code)) {
      return null;
    }

    const invalid = isZdpAuthFeedbackErrorCode(value.code);
    switch (value.code) {
      case 'waiting':
        return { code: value.code, message: catalog.status.waiting, invalid };
      case 'registered':
        return { code: value.code, message: catalog.feedback.registered, invalid };
      case 'invalid_input':
        return { code: value.code, message: catalog.feedback.invalidInput, invalid };
      case 'invalid_credentials':
        return {
          code: value.code,
          message: currentMode === 'login' ? catalog.feedback.loginFailed : catalog.feedback.invalidInput,
          invalid
        };
      case 'rate_limited':
      case 'unavailable':
        return {
          code: value.code,
          message: currentMode === 'signup'
            ? catalog.feedback.signupUnavailable
            : catalog.feedback.loginUnavailable,
          invalid
        };
      case 'expired':
        return { code: value.code, message: catalog.feedback.expiredPage, invalid };
    }
  }

  function getFeedbackKey(value: ZdpAuthFeedback | null): string | null {
    if (!value || !isZdpAuthFeedbackCode(value.code)) {
      return null;
    }

    const sequence = typeof value.sequence === 'number'
      && Number.isSafeInteger(value.sequence)
      && value.sequence >= 0
      ? value.sequence
      : 0;
    return `${value.code}:${sequence}`;
  }

  async function focusFeedback(expectedKey: string): Promise<void> {
    await tick();
    if (!submitting && pendingFocusKey === expectedKey && visibleErrorKey === expectedKey && feedbackElement?.isConnected) {
      feedbackElement.focus();
      pendingFocusKey = null;
    }
  }
</script>

<Surface padding="lg">
  <form
    class="zdp-auth-shell"
    action={action ?? undefined}
    method={formMethod}
    data-mode={mode}
    data-availability={availability}
    aria-busy={submitting ? 'true' : 'false'}
    onsubmit={handleSubmit}
  >
    <fieldset class="zdp-auth-shell__controls" disabled={submitting}>
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

        {#if submitting}
          <p class="zdp-auth-shell__notice" role="status" aria-live="polite">{messages.status.waiting}</p>
        {:else if typedFeedback}
          {#if typedFeedback.invalid}
            <p
              bind:this={feedbackElement}
              class="zdp-auth-shell__status zdp-auth-shell__status--error"
              data-feedback-code={typedFeedback.code}
              role="alert"
              aria-live="assertive"
              tabindex="-1"
            >{typedFeedback.message}</p>
          {:else}
            <p
              bind:this={feedbackElement}
              class="zdp-auth-shell__status"
              data-feedback-code={typedFeedback.code}
              role="status"
              aria-live="polite"
            >{typedFeedback.message}</p>
          {/if}
        {:else if status}
          {#if invalid}
            <p
              bind:this={feedbackElement}
              class="zdp-auth-shell__status zdp-auth-shell__status--error"
              role="alert"
              aria-live="assertive"
              tabindex="-1"
            >{status}</p>
          {:else}
            <p class="zdp-auth-shell__status" role="status" aria-live="polite">{status}</p>
          {/if}
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
          {#if termsHref && (mode !== 'signup' || (preparing && !signupTermsInSlot))}
            <Link href={termsHref} target="_blank" rel="noopener noreferrer">{messages.links.terms}</Link>
          {/if}
          {#if privacyHref}
            <Link href={privacyHref}>{messages.links.privacy}</Link>
          {/if}
        </nav>
      </Stack>
    </fieldset>
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

  .zdp-auth-shell__controls {
    border: 0;
    margin: 0;
    min-width: 0;
    padding: 0;
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
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
    margin: 0;
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-auth-shell__status--error {
    color: var(--zdp-color-accent-danger);
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
