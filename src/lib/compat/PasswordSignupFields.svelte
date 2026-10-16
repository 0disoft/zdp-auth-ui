<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import View from '../components/PasswordSignupFields.svelte';
  import { getAuthMessages, type ZdpAuthMessages } from '../i18n';
  import type { ZdpPasswordSignupContract } from '../password-signup';

  type $$Props = Omit<ComponentProps<typeof View>, 'messages'> & { messages?: ZdpAuthMessages };
  export let messages: ZdpAuthMessages | undefined = undefined;
  export let contract: ZdpPasswordSignupContract;
  export let loginId = '';
  export let password = '';
  export let termsAccepted = false;
  export let minimumAgeConfirmed = false;
  $: rest = $$restProps as Omit<$$Props, 'messages' | 'loginId' | 'password' | 'termsAccepted' | 'minimumAgeConfirmed' | 'contract'>;
</script>

<View {...rest} {contract} messages={messages ?? getAuthMessages(contract.locale)} bind:loginId bind:password bind:termsAccepted bind:minimumAgeConfirmed />
