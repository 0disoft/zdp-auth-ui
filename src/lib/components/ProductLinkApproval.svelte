<script lang="ts">
  import { Button, Inline, Stack, Surface } from 'zdp-design-system';
  import { onMount, tick } from 'svelte';
  import { getAuthMessages, type ZdpAuthLocale } from '../i18n';
  import {
    validateProductLinkRequest,
    type ZdpProductLinkDecision,
    type ZdpProductLinkDecisionDetail,
    type ZdpProductLinkDisposition,
    type ZdpProductLinkRequest,
    type ZdpProductLinkTrustPolicy
  } from '../product-link';

  export let id: string;
  export let locale: ZdpAuthLocale | string = 'en';
  export let enabled = false;
  export let request: ZdpProductLinkRequest;
  export let trust: ZdpProductLinkTrustPolicy;
  export let now: Date | null = null;
  export let busy = false;
  export let ondecision: ((detail: ZdpProductLinkDecisionDetail, event: MouseEvent) => void) | null = null;

  let mounted = false;
  let deadlineTimer: ReturnType<typeof setTimeout> | null = null;
  let clockNow = new Date();
  let decisionFocusRequested = false;
  let previousDisposition: ZdpProductLinkDisposition | null = null;
  let sectionElement: HTMLElement;
  let statusElement: HTMLParagraphElement;

  $: messages = getAuthMessages(locale);
  $: effectiveNow = now ?? clockNow;
  $: validation = enabled
    ? validateProductLinkRequest(request, trust, effectiveNow)
    : { disposition: 'invalid' as const, actionable: false };
  $: titleId = `${id}-title`;
  $: detailsId = `${id}-details`;
  $: statusMessage = enabled
    ? messages.productLink.status[validation.disposition]
    : messages.productLink.status.disabled;
  $: formattedExpiry = formatExpiry(request.expiresAt, locale);
  $: {
    const nextDisposition = validation.disposition;
    if (
      mounted
      && previousDisposition === 'ready'
      && nextDisposition !== 'ready'
      && (decisionFocusRequested || sectionElement?.contains(document.activeElement))
    ) {
      focusStatusAfterUpdate();
    }
    if (previousDisposition === 'ready' && nextDisposition !== 'ready') {
      decisionFocusRequested = false;
    }
    previousDisposition = nextDisposition;
  }
  $: if (mounted && decisionFocusRequested && validation.disposition === 'ready' && !busy) {
    decisionFocusRequested = false;
  }
  $: if (mounted) {
    if (now === null) {
      scheduleDeadlineRefresh(request.issuedAt, request.expiresAt, trust.maxRequestAgeMs);
    } else {
      clearDeadlineRefresh();
    }
  }

  onMount(() => {
    mounted = true;
    if (now === null) {
      clockNow = new Date();
    }

    return () => {
      clearDeadlineRefresh();
    };
  });

  function handleDecision(decision: ZdpProductLinkDecision, event: MouseEvent): void {
    if (!enabled || busy || !validation.actionable) {
      return;
    }

    const decisionNow = now ?? new Date();
    if (!validateProductLinkRequest(request, trust, decisionNow).actionable) {
      if (now === null) clockNow = decisionNow;
      return;
    }

    decisionFocusRequested = true;
    ondecision?.({ challengeRef: request.challengeRef, decision }, event);
  }

  function formatExpiry(value: string, requestedLocale: string): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) {
      return messages.productLink.status.invalid;
    }

    try {
      return new Intl.DateTimeFormat(requestedLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(date);
    } catch {
      return new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(date);
    }
  }

  function scheduleDeadlineRefresh(issuedAt: string, expiresAt: string, maxRequestAgeMs: number): void {
    clearDeadlineRefresh();

    const issuedAtMs = Date.parse(issuedAt);
    const expiresAtMs = Date.parse(expiresAt);
    if (
      !Number.isFinite(issuedAtMs)
      || !Number.isFinite(expiresAtMs)
      || !Number.isSafeInteger(maxRequestAgeMs)
      || maxRequestAgeMs <= 0
      || maxRequestAgeMs > 600_000
    ) {
      return;
    }

    const deadlineMs = Math.min(expiresAtMs, issuedAtMs + maxRequestAgeMs);
    const delayMs = Math.max(0, deadlineMs - Date.now() + 1);
    deadlineTimer = setTimeout(() => {
      clockNow = new Date();
      deadlineTimer = null;
    }, delayMs);
  }

  function clearDeadlineRefresh(): void {
    if (deadlineTimer !== null) {
      clearTimeout(deadlineTimer);
      deadlineTimer = null;
    }
  }

  async function focusStatusAfterUpdate(): Promise<void> {
    await tick();
    statusElement?.focus();
  }
</script>

<Surface padding="lg">
  <section bind:this={sectionElement} class="zdp-product-link" aria-labelledby={titleId} aria-describedby={detailsId}>
    <Stack gap="md">
      <header class="zdp-product-link__header">
        <p class="zdp-product-link__eyebrow">{messages.brand}</p>
        <h1 id={titleId}>{messages.productLink.title}</h1>
        <p id={detailsId}>{messages.productLink.summary}</p>
      </header>

      {#if enabled && validation.disposition !== 'invalid'}
        <dl class="zdp-product-link__context">
          <div>
            <dt>{messages.productLink.fields.product}</dt>
            <dd>{request.productLabel}</dd>
          </div>
          <div>
            <dt>{messages.productLink.fields.account}</dt>
            <dd>{request.accountLabel}</dd>
          </div>
          <div>
            <dt>{messages.productLink.fields.workspace}</dt>
            <dd>{request.workspaceLabel ?? messages.productLink.noWorkspace}</dd>
          </div>
          <div>
            <dt>{messages.productLink.fields.expires}</dt>
            <dd><time datetime={request.expiresAt}>{formattedExpiry}</time></dd>
          </div>
        </dl>

        <section class="zdp-product-link__requested" aria-labelledby={`${id}-requested-title`}>
          <h2 id={`${id}-requested-title`}>{messages.productLink.requestedTitle}</h2>
          <ul>
            {#each request.requestedItems as item (item.ref)}
              <li>
                <span class="zdp-product-link__item-kind">{messages.productLink.itemKinds[item.kind]}</span>
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </li>
            {/each}
          </ul>
        </section>

        <section class="zdp-product-link__consent" aria-labelledby={`${id}-consent-title`}>
          <h2 id={`${id}-consent-title`}>{messages.productLink.consentTitle}</h2>
          <ul>
            {#each request.consentImplications as implication}
              <li>{implication}</li>
            {/each}
          </ul>
          <p>{messages.productLink.consentBoundary}</p>
        </section>
      {/if}

      {#if validation.actionable}
        <Inline gap="sm" align="stretch" justify="between">
          <Button type="button" disabled={busy} onclick={(event: MouseEvent) => handleDecision('approve', event)}>
            {messages.productLink.actions.approve}
          </Button>
          <Button type="button" variant="secondary" disabled={busy} onclick={(event: MouseEvent) => handleDecision('deny', event)}>
            {messages.productLink.actions.deny}
          </Button>
        </Inline>
      {/if}

      <p
        bind:this={statusElement}
        class:zdp-product-link__status--error={validation.disposition === 'invalid' || validation.disposition === 'stale' || validation.disposition === 'expired'}
        class="zdp-product-link__status"
        role={validation.disposition === 'invalid' || validation.disposition === 'stale' || validation.disposition === 'expired' ? 'alert' : 'status'}
        aria-live={busy || !validation.actionable ? 'polite' : 'off'}
        tabindex="-1"
      >
        {busy && validation.actionable ? messages.productLink.status.submitting : statusMessage}
      </p>
    </Stack>
  </section>
</Surface>

<style>
  .zdp-product-link {
    color: var(--zdp-color-ink-normal);
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
    text-wrap: var(--zdp-i18n-text-wrap);
    word-break: var(--zdp-i18n-word-break);
  }

  .zdp-product-link__header,
  .zdp-product-link__requested,
  .zdp-product-link__consent {
    display: grid;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-product-link h1,
  .zdp-product-link h2,
  .zdp-product-link p,
  .zdp-product-link ul,
  .zdp-product-link dl,
  .zdp-product-link dd {
    margin: 0;
  }

  .zdp-product-link h1 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-font-size-xl);
    line-height: var(--zdp-font-line-height-tight);
  }

  .zdp-product-link h2 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-font-size-lg);
    line-height: var(--zdp-font-line-height-tight);
  }

  .zdp-product-link__eyebrow,
  .zdp-product-link__item-kind {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-label-size);
    line-height: var(--zdp-type-label-line-height);
  }

  .zdp-product-link__context {
    display: grid;
    gap: var(--zdp-space-3);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .zdp-product-link__context div {
    display: grid;
    gap: var(--zdp-space-1);
    min-width: 0;
  }

  .zdp-product-link__context dt {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
  }

  .zdp-product-link__context dd {
    color: var(--zdp-color-ink-strong);
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .zdp-product-link__requested ul,
  .zdp-product-link__consent ul {
    display: grid;
    gap: var(--zdp-space-2);
    padding-inline-start: var(--zdp-space-5);
  }

  .zdp-product-link__requested li {
    display: grid;
    gap: var(--zdp-space-1);
  }

  .zdp-product-link__status {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
  }

  .zdp-product-link__status--error {
    color: var(--zdp-color-accent-danger);
  }

  @media (max-width: 40rem) {
    .zdp-product-link__context {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
