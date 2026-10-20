<script lang="ts">
  import PasskeySettings from '../../../src/lib/components/PasskeySettings.svelte';
  import { messages, passkeySettingsMessages } from '../../../src/lib/i18n/en';
  import type { ZdpPasskeySettingsState } from '../../../src/lib/passkey-settings-contract';
  import { flushSync } from 'svelte';

  let state: ZdpPasskeySettingsState = $state({
    status: 'ready',
    passkeys: [{ passkey_id: 'key-1', label: 'First key', created_at: '2026-10-02T12:00:00Z', last_used_at: null }],
    capabilities: { register: true, rename: true, revoke: true },
    reauthentication: 'password'
  });
  let actions = $state('');
  let outside: HTMLButtonElement;
  export function update(patch: Partial<ZdpPasskeySettingsState>) {
    state = { ...state, ...patch };
  }
  export function updateThenFocusOutside(patch: Partial<ZdpPasskeySettingsState>) {
    flushSync(() => update(patch));
    outside.focus();
  }
</script>

<section data-testid="passkey-policy-fixture">
  <PasskeySettings idPrefix="policy-settings" {state}
    messages={passkeySettingsMessages} authMessages={messages}
    onaction={detail => { actions = JSON.stringify(detail); }} />
  <button bind:this={outside} type="button" data-testid="policy-outside">Outside editor</button>
  <output>{actions}</output>
</section>
