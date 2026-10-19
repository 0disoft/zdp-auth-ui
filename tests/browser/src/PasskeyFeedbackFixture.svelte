<script lang="ts">
  import PasskeySettings from '../../../src/lib/components/PasskeySettings.svelte';
  import { messages, passkeySettingsMessages } from '../../../src/lib/i18n/en';
  import type { ZdpPasskeySettingsFeedback, ZdpPasskeySettingsState } from '../../../src/lib/passkey-settings-contract';

  const settingsState: ZdpPasskeySettingsState = {
    status: 'ready', passkeys: [], reauthentication: 'passkey',
    capabilities: { register: true, rename: true, revoke: true }
  };
  let feedback = $state<ZdpPasskeySettingsFeedback>(null);
  let sequence = $state(0);
</script>

<section data-testid="passkey-feedback-fixture">
  <PasskeySettings idPrefix="feedback-settings" state={settingsState} locale="en"
    messages={passkeySettingsMessages} authMessages={messages} {feedback} feedbackSequence={sequence}
    onaction={detail => { sequence = detail.sequence ?? 0; feedback = null; }} />
  <button type="button" data-testid="deliver-saved" onclick={() => { feedback = 'saved'; }}>Deliver saved response</button>
  <button type="button" data-testid="deliver-failed" onclick={() => { feedback = 'failed'; }}>Deliver failed response</button>
  <button type="button" data-testid="clear-feedback" onclick={() => { feedback = null; }}>Clear response</button>
  <output data-testid="feedback-sequence">{sequence}</output>
</section>
