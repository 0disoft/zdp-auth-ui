<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import View from '../components/PasskeySettings.svelte';
  import { getAuthMessages, type ZdpAuthMessages } from '../i18n';
  import { getPasskeySettingsMessages, type ZdpPasskeySettingsMessages } from '../passkey-settings-messages';

  type Props = Omit<ComponentProps<typeof View>, 'messages' | 'authMessages'> & { messages?: ZdpPasskeySettingsMessages; authMessages?: ZdpAuthMessages };
  let { messages = undefined, locale = 'en', authMessages = undefined, ...rest }: Props = $props();
</script>

<View {...rest} {locale} messages={messages ?? getPasskeySettingsMessages(locale)} authMessages={authMessages ?? getAuthMessages(locale)} />
