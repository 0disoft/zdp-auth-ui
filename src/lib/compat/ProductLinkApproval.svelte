<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import View from '../components/ProductLinkApproval.svelte';
  import { getAuthMessages, type ZdpAuthMessages } from '../i18n';

  type Props = Omit<ComponentProps<typeof View>, 'messages'> & { messages?: ZdpAuthMessages };
  let { messages = undefined, locale = 'en', ...rest }: Props = $props();
</script>

<View {...rest} {locale} messages={messages ?? getAuthMessages(locale)} />
