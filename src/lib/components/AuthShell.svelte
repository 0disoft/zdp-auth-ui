<script lang="ts">
  import {
    Button,
    Divider,
    Inline,
    Link,
    Stack,
    Surface
  } from 'zdp-design-system';
  import type {
    ZdpAuthMode,
    ZdpAuthModeChangeDetail,
    ZdpAuthProvider,
    ZdpAuthProviderSelectDetail,
    ZdpAuthSubmitDetail
  } from '../auth-contract';
  import { getAuthMessages, type ZdpAuthLocale } from '../i18n';
  import ProviderButton from './ProviderButton.svelte';

  export let locale: ZdpAuthLocale | string = 'en';
  export let mode: ZdpAuthMode = 'login';
  export let providers: readonly ZdpAuthProvider[] = [];
  export let action: string | null = null;
  export let method: 'post' = 'post';
  export let status: string | null = null;
  export let invalid = false;
  export let termsHref: string | null = null;
  export let privacyHref: string | null = null;
  export let onsubmit: ((detail: ZdpAuthSubmitDetail, event: SubmitEvent) => void) | null = null;
  export let onproviderselect: ((detail: ZdpAuthProviderSelectDetail, event: MouseEvent) => void) | null = null;
  export let onmodechange: ((detail: ZdpAuthModeChangeDetail, event: MouseEvent) => void) | null = null;

  $: messages = getAuthMessages(locale);
  $: title = messages.title[mode];
  $: summary = messages.summary[mode];
  $: primaryAction = messages.actions[mode];
  $: nextMode = getNextMode(mode);
  $: nextModeLabel = mode === 'login' ? messages.links.signup : messages.links.login;
  $: formMethod = getFormMethod(method);

  function handleSubmit(event: SubmitEvent): void {
    const form = event.currentTarget as HTMLFormElement;
    if (onsubmit || !action) {
      event.preventDefault();
    }
    onsubmit?.({ mode, form }, event);
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
</script>

<Surface padding="lg">
  <form
    class="zdp-auth-shell"
    action={action ?? undefined}
    method={formMethod}
    data-mode={mode}
    novalidate
    onsubmit={handleSubmit}
  >
    <Stack gap="md">
      <header class="zdp-auth-shell__header">
        <p class="zdp-auth-shell__eyebrow">{messages.brand}</p>
        <h1>{title}</h1>
        <p class="zdp-auth-shell__summary">{summary}</p>
      </header>

      {#if providers.length > 0}
        <div class="zdp-auth-shell__providers" role="group" aria-label={messages.providers.groupLabel}>
          {#each providers as provider (provider.id)}
            <ProviderButton {provider} onclick={handleProviderSelect} />
          {/each}
        </div>
        <Divider />
      {/if}

      <slot />

      {#if status}
        <p class="zdp-auth-shell__status" role={invalid ? 'alert' : 'status'} aria-live={invalid ? 'assertive' : 'polite'}>{status}</p>
      {/if}

      <Inline gap="sm" align="stretch" justify="between">
        <Button type="submit">{primaryAction}</Button>
        {#if mode !== 'recovery'}
          <Button type="button" variant="secondary" onclick={handleModeChange}>{nextModeLabel}</Button>
        {/if}
      </Inline>

      <nav class="zdp-auth-shell__links" aria-label={messages.navigation.accountHelp}>
        {#if mode !== 'recovery'}
          <Link href="?mode=recovery">{messages.links.recovery}</Link>
        {/if}
        {#if termsHref}
          <Link href={termsHref}>{messages.links.terms}</Link>
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
    font-size: var(--zdp-font-size-xl);
    line-height: var(--zdp-font-line-height-tight);
  }

  .zdp-auth-shell__eyebrow {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-label-size);
    line-height: var(--zdp-type-label-line-height);
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

  .zdp-auth-shell__links {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-3);
    min-width: 0;
  }
</style>
