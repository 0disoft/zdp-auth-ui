<script lang="ts">
  import { Button } from 'zdp-design-system';
  import type { ZdpAuthProvider } from '../auth-contract';

  export let provider: ZdpAuthProvider;
  export let disabled = false;
  export let onclick: ((provider: ZdpAuthProvider, event: MouseEvent) => void) | null = null;

  function handleClick(event: MouseEvent): void {
    onclick?.(provider, event);
  }
</script>

<Button variant="secondary" size="md" disabled={disabled || provider.disabled} onclick={handleClick}>
  <span class="zdp-auth-provider-button__mark" aria-hidden="true">
    {(provider.iconLabel ?? provider.label).slice(0, 1)}
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
    width: var(--zdp-control-choice-size);
  }
</style>

