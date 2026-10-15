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
  $: if (value === '') visible = false;

  function hideOnFormReset(node: HTMLDivElement) {
    const input = node.querySelector('input');
    const roots = new Set<EventTarget>();
    let active = true;
    let observedTree: Node | null = null;
    let observer: MutationObserver | null = null;
    const handled = new WeakSet<Event>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const onReset = (event: Event) => {
      const form = input?.form;
      if (!form || event.target !== form || handled.has(event)) return;
      handled.add(event);
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (!event.defaultPrevented && input?.isConnected && input.form === form) visible = false;
      }, 0);
      timers.add(timer);
    };
    function refreshOwnership() {
      if (!active) return;
      const tree = node.getRootNode();
      const nextRoots = new Set<EventTarget>([node.ownerDocument, tree, ...(input?.form ? [input.form] : [])]);
      for (const root of roots) {
        if (!nextRoots.has(root)) {
          root.removeEventListener('reset', onReset, true);
          roots.delete(root);
        }
      }
      for (const root of nextRoots) {
        if (!roots.has(root)) {
          root.addEventListener('reset', onReset, true);
          roots.add(root);
        }
      }
      if (tree !== observedTree) {
        observer?.disconnect();
        observedTree = tree;
        const Observer = node.ownerDocument.defaultView?.MutationObserver;
        observer = Observer ? new Observer(refreshOwnership) : null;
        observer?.observe(tree, { childList: true, subtree: true, attributes: true, attributeFilter: ['form', 'id'] });
      }
    }
    refreshOwnership();
    return { destroy() {
      active = false;
      observer?.disconnect();
      for (const root of roots) root.removeEventListener('reset', onReset, true);
      for (const timer of timers) clearTimeout(timer);
    } };
  }

  $: messages = getAuthMessages(locale);
  $: labelText = label ?? messages.fields.password;
  $: helpId = helpText && !errorText ? `${id}-help` : null;
  $: errorId = errorText ? `${id}-error` : null;
  $: describedByIds = [describedBy, helpId, errorId].flat().filter(Boolean) as string[];
  $: toggleLabel = visible ? messages.actions.hidePassword : messages.actions.showPassword;
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

  .zdp-auth-password-field__toggle-icon {
    display: block;
    height: 1.125rem;
    width: 1.125rem;
  }
</style>
