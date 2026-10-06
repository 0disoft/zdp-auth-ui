<script lang="ts">
  import { Button } from 'zdp-design-system';
  import type { ZdpAuthProvider } from '../auth-contract';

  export let provider: ZdpAuthProvider;
  export let disabled = false;
  export let onclick: ((provider: ZdpAuthProvider, event: MouseEvent) => void) | null = null;

  function handleClick(event: MouseEvent): void {
    onclick?.(provider, event);
  }

  function getProviderMark(provider: ZdpAuthProvider): string {
    const source = provider.iconLabel ?? provider.label;
    return Array.from(source.trim())[0]?.toLocaleUpperCase() ?? '';
  }
</script>

<Button variant="secondary" size="md" disabled={disabled || provider.disabled} onclick={handleClick}>
  <span class="zdp-auth-provider-button__mark" class:zdp-auth-provider-button__mark--passkey={provider.kind === 'passkey'} aria-hidden="true">
    {#if provider.kind === 'passkey'}
      <svg class="zdp-auth-provider-button__passkey-icon" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true" focusable="false">
        <circle cx="8" cy="7" r="3" />
        <path d="M2 20v-2a6 6 0 0 1 11-3" />
        <circle cx="18" cy="12" r="3" />
        <path d="M18 15v7m0-3h3" />
      </svg>
    {:else}
      {getProviderMark(provider)}
    {/if}
  </span>
  <span>{provider.label}</span>
</Button>

<style>
  .zdp-auth-provider-button__mark {
    align-items: center;
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    display: inline-flex;
    font-size: var(--zdp-type-caption-size);
    height: var(--zdp-control-choice-size);
    justify-content: center;
    line-height: 1;
    min-width: var(--zdp-control-choice-size);
    overflow: hidden;
    padding-inline: var(--zdp-space-1);
    text-align: center;
  }

  .zdp-auth-provider-button__mark--passkey {
    border: 0;
    padding-inline: 0;
    width: var(--zdp-control-choice-size);
  }

  .zdp-auth-provider-button__passkey-icon {
    display: block;
    height: 100%;
    width: 100%;
  }
</style>
