<script lang="ts">
  import { Button, Inline, Stack, Surface } from 'zdp-design-system';
  import { onMount, tick } from 'svelte';
  import type { ZdpAuthMessages, ZdpAuthLocale } from '../i18n';
  import {
    validateProductLinkRequest,
    type ZdpProductLinkDecision,
    type ZdpProductLinkDecisionDetail,
    type ZdpProductLinkDisposition,
    type ZdpProductLinkRequest,
    type ZdpProductLinkTrustPolicy
  } from '../product-link';

  interface Props {
    messages: ZdpAuthMessages;
    id: string;
    locale?: ZdpAuthLocale | string;
    enabled?: boolean;
    request: ZdpProductLinkRequest;
    trust: ZdpProductLinkTrustPolicy;
    now?: Date | null;
    busy?: boolean;
    ondecision?: ((detail: ZdpProductLinkDecisionDetail, event: MouseEvent) => void) | null;
  }

  let {
    messages,
    id,
    locale = 'en',
    enabled = false,
    request,
    trust,
    now = null,
    busy = false,
    ondecision = null
  }: Props = $props();

  let mounted = $state(false);
  let deadlineTimer: ReturnType<typeof setTimeout> | null = null;
  let clockNow = $state(new Date());
  let clockScope: string | null = null;
  let clockWallOrigin = 0;
  let clockElapsedOrigin = 0;
  let clockHighWater = 0;
  let decisionFocusRequested = $state(false);
  let sameTaskDecisionHandled = false;
  let previousDisposition: ZdpProductLinkDisposition | null = $state(null);
  let sectionElement: HTMLElement | undefined = $state();
  let statusElement: HTMLParagraphElement | undefined = $state();


  onMount(() => {
    mounted = true;

    return () => {
      clearDeadlineRefresh();
    };
  });

  function handleDecision(decision: ZdpProductLinkDecision, event: MouseEvent): void {
    if (!enabled || busy || sameTaskDecisionHandled || !validation.actionable) {
      return;
    }

    const decisionNow = now ?? readClock();
    if (!validateProductLinkRequest(request, trust, decisionNow).actionable) {
      if (now === null) clockNow = decisionNow;
      return;
    }

    sameTaskDecisionHandled = true;
    queueMicrotask(() => { sameTaskDecisionHandled = false; });
    decisionFocusRequested = true;
    ondecision?.({ challengeRef: request.challengeRef, decision }, event);
  }

  function formatExpiry(value: string): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) {
      return copy.productLink.status.invalid;
    }

    return dateFormatter.format(date);
  }

  function scheduleDeadlineRefresh(issuedAt: string, expiresAt: string, maxRequestAgeMs: number): void {
    clearDeadlineRefresh();
    if (request?.state !== 'pending') return;

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

    const nowMs = readClock().getTime();
    if (expiresAtMs <= nowMs) return;
    // Expiry is inclusive; request age becomes stale only after the age limit.
    const deadlines = [expiresAtMs, issuedAtMs + maxRequestAgeMs + 1]
      .filter(deadline => Number.isSafeInteger(deadline) && deadline > nowMs);
    if (deadlines.length === 0) return;
    const delayMs = Math.min(...deadlines) - nowMs;
    deadlineTimer = setTimeout(() => {
      clockNow = readClock();
      deadlineTimer = null;
      scheduleDeadlineRefresh(issuedAt, expiresAt, maxRequestAgeMs);
    }, delayMs);
  }

  function readClock(): Date {
    const scope = request?.challengeRef ?? '';
    const wall = Date.now(), elapsed = performance.now();
    if (clockScope !== scope) {
      clockScope = scope;
      clockWallOrigin = wall;
      clockElapsedOrigin = elapsed;
      clockHighWater = wall;
    }
    // Preserve elapsed lifetime and already observed expiry across clock changes
    // and snapshot refreshes. A newly issued challenge starts its own clock.
    clockHighWater = Math.max(clockHighWater, wall, clockWallOrigin + Math.max(0, elapsed - clockElapsedOrigin));
    return new Date(clockHighWater);
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
  let copy = $derived(messages);
  let dateFormatter = $derived.by(() => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    };
    try { return new Intl.DateTimeFormat(locale, options); }
    catch { return new Intl.DateTimeFormat('en', options); }
  });
  $effect.pre(() => {
    if (mounted) {
      if (enabled && now === null) {
        clockNow = readClock();
        scheduleDeadlineRefresh(request?.issuedAt ?? '', request?.expiresAt ?? '', trust?.maxRequestAgeMs ?? 0);
      } else {
        clearDeadlineRefresh();
      }
    }
  });
  let effectiveNow = $derived(now ?? clockNow);
  let validation = $derived(enabled
    ? validateProductLinkRequest(request, trust, effectiveNow)
    : { disposition: 'invalid' as const, actionable: false });
  let titleId = $derived(`${id}-title`);
  let detailsId = $derived(`${id}-details`);
  let statusMessage = $derived(enabled
    ? copy.productLink.status[validation.disposition]
    : copy.productLink.status.disabled);
  let formattedExpiry = $derived(validation.disposition === 'invalid'
    ? copy.productLink.status.invalid
    : formatExpiry(request.expiresAt));
  $effect.pre(() => {
    const nextDisposition = validation.disposition;
    if (
      mounted
      && previousDisposition === 'ready'
      && nextDisposition !== 'ready'
      && (decisionFocusRequested || sectionElement?.matches(':focus-within'))
    ) {
      focusStatusAfterUpdate();
    }
    if (previousDisposition === 'ready' && nextDisposition !== 'ready') {
      decisionFocusRequested = false;
    }
    previousDisposition = nextDisposition;
  });
  $effect.pre(() => {
    if (mounted && decisionFocusRequested && validation.disposition === 'ready' && !busy) {
      decisionFocusRequested = false;
    }
  });
</script>

<Surface padding="lg">
  <section bind:this={sectionElement} class="zdp-product-link" aria-labelledby={titleId} aria-describedby={detailsId}>
    <Stack gap="md">
      <header class="zdp-product-link__header">
        <p class="zdp-product-link__eyebrow">{copy.brand}</p>
        <h1 id={titleId}>{copy.productLink.title}</h1>
        <p id={detailsId}>{copy.productLink.summary}</p>
      </header>

      {#if enabled && validation.disposition !== 'invalid'}
        <dl class="zdp-product-link__context">
          <div>
            <dt>{copy.productLink.fields.product}</dt>
            <dd>{request.productLabel}</dd>
          </div>
          <div>
            <dt>{copy.productLink.fields.account}</dt>
            <dd>{request.accountLabel}</dd>
          </div>
          <div>
            <dt>{copy.productLink.fields.workspace}</dt>
            <dd>{request.workspaceLabel ?? copy.productLink.noWorkspace}</dd>
          </div>
          <div>
            <dt>{copy.productLink.fields.expires}</dt>
            <dd><time datetime={request.expiresAt}>{formattedExpiry}</time></dd>
          </div>
        </dl>

        <section class="zdp-product-link__requested" aria-labelledby={`${id}-requested-title`}>
          <h2 id={`${id}-requested-title`}>{copy.productLink.requestedTitle}</h2>
          <ul>
            {#each request.requestedItems as item (item.ref)}
              <li>
                <span class="zdp-product-link__item-kind">{copy.productLink.itemKinds[item.kind]}</span>
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </li>
            {/each}
          </ul>
        </section>

        <section class="zdp-product-link__consent" aria-labelledby={`${id}-consent-title`}>
          <h2 id={`${id}-consent-title`}>{copy.productLink.consentTitle}</h2>
          <ul>
            {#each request.consentImplications as implication}
              <li>{implication}</li>
            {/each}
          </ul>
          <p>{copy.productLink.consentBoundary}</p>
        </section>
      {/if}

      {#if validation.actionable}
        <Inline gap="sm" align="stretch" justify="between">
          <Button type="button" disabled={busy} onclick={(event: MouseEvent) => handleDecision('approve', event)}>
            {copy.productLink.actions.approve}
          </Button>
          <Button type="button" variant="secondary" disabled={busy} onclick={(event: MouseEvent) => handleDecision('deny', event)}>
            {copy.productLink.actions.deny}
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
        {busy && validation.actionable ? copy.productLink.status.submitting : statusMessage}
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
