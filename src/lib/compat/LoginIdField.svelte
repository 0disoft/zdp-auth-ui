<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import View from '../components/LoginIdField.svelte';
  import { getAuthMessages, type ZdpAuthMessages } from '../i18n';

  type $$Props = Omit<ComponentProps<typeof View>, 'messages'> & { messages?: ZdpAuthMessages };
  export let messages: ZdpAuthMessages | undefined = undefined;
  export let locale = 'en';
  export let value = '';
  $: rest = $$restProps as Omit<$$Props, 'messages' | 'value' | 'locale'>;
</script>

<View {...rest} {locale} messages={messages ?? getAuthMessages(locale)} bind:value />
