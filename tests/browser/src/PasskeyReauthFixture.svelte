<script lang="ts">
  import PasskeySettings from '../../../src/lib/components/PasskeySettings.svelte';
  import type { ZdpPasskeySettingsState } from '../../../src/lib/passkey-settings-contract';

  let state: ZdpPasskeySettingsState = {
    status: 'ready', passkeys: [], capabilities: { register: true, rename: false, revoke: false },
    reauthentication: 'password'
  };
</script>

<section data-testid="passkey-reauth-fixture">
  <PasskeySettings idPrefix="reauth-settings" {state} onaction={() => {}} />
  <button type="button" data-testid="use-passkey" onclick={() => state = { ...state, reauthentication: 'passkey' }}>Use passkey</button>
  <button type="button" data-testid="use-password" onclick={() => state = { ...state, reauthentication: 'password' }}>Use password</button>
</section>
