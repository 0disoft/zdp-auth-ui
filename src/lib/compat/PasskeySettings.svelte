<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import View from '../components/PasskeySettings.svelte';
  import { getAuthMessages, type ZdpAuthMessages } from '../i18n';
  import { getPasskeySettingsMessages, type ZdpPasskeySettingsMessages } from '../passkey-settings-messages';

  type $$Props = Omit<ComponentProps<typeof View>, 'messages' | 'authMessages'> & { messages?: ZdpPasskeySettingsMessages; authMessages?: ZdpAuthMessages };
  export let messages: ZdpPasskeySettingsMessages | undefined = undefined;
  export let locale = 'en';
  export let authMessages: ZdpAuthMessages | undefined = undefined;
  $: rest = $$restProps as Omit<$$Props, 'messages' | 'locale' | 'authMessages'>;
</script>

<View {...rest} {locale} messages={messages ?? getPasskeySettingsMessages(locale)} authMessages={authMessages ?? getAuthMessages(locale)} />
