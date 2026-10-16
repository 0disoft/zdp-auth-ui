<script lang="ts">
  import { PasskeySettings } from 'zdp-auth-ui/components';
  import { locale, messages, passkeySettingsMessages } from 'zdp-auth-ui/i18n/en';
  import { loadAuthLocale } from 'zdp-auth-ui/i18n/loader';
  import type { ZdpPasskeySettingsState } from '../../../src/lib/passkey-settings-contract';

  let state: ZdpPasskeySettingsState = {
    status: 'ready', passkeys: [], capabilities: { register: true, rename: false, revoke: false },
    reauthentication: 'password'
  };
  let catalog = { locale: locale as string, messages, passkeySettingsMessages };
</script>

<section data-testid="passkey-reauth-fixture">
  <PasskeySettings idPrefix="reauth-settings" {state} locale={catalog.locale}
    messages={catalog.passkeySettingsMessages} authMessages={catalog.messages} onaction={() => {}} />
  <button type="button" data-testid="use-passkey" onclick={() => state = { ...state, reauthentication: 'passkey' }}>Use passkey</button>
  <button type="button" data-testid="use-password" onclick={() => state = { ...state, reauthentication: 'password' }}>Use password</button>
  <button type="button" onclick={async () => { catalog = await loadAuthLocale('ko'); }}>Load Korean</button>
</section>
