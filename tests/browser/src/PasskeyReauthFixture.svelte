<script lang="ts">
  import { PasskeySettings } from 'zdp-auth-ui/components';
  import { locale, messages, passkeySettingsMessages } from 'zdp-auth-ui/i18n/en';
  import { loadAuthLocale } from 'zdp-auth-ui/i18n/loader';
  import type { ZdpPasskeySettingsState } from '../../../src/lib/passkey-settings-contract';

  let state: ZdpPasskeySettingsState = {
    status: 'ready', passkeys: [
      { passkey_id: 'key-1', label: 'First key', created_at: '2026-10-02T12:00:00Z', last_used_at: '2026-10-03T12:00:00Z' },
      { passkey_id: 'key-2', label: 'Second key', created_at: '2026-10-04T12:00:00Z', last_used_at: '2026-10-05T12:00:00Z' },
      { passkey_id: 'key-3', label: 'Invalid date key', created_at: 'invalid-date', last_used_at: null }
    ], capabilities: { register: true, rename: true, revoke: false },
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
  <button type="button" onclick={async () => { catalog = await loadAuthLocale('en'); }}>Load English</button>
  <button type="button" onclick={() => { catalog = { ...catalog, locale: 'invalid_locale' }; }}>Invalid date locale</button>
  <button type="button" onclick={() => { state = { ...state, passkeys: state.passkeys.map(key => ({ ...key })) }; }}>Refresh passkeys</button>
</section>
