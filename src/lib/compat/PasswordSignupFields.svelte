<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import View from '../components/PasswordSignupFields.svelte';
  import { getAuthMessages, type ZdpAuthMessages } from '../i18n';
  import type { ZdpPasswordSignupContract } from '../password-signup';

  type Props = Omit<ComponentProps<typeof View>, 'messages'> & { messages?: ZdpAuthMessages };
  let {
    messages = undefined,
    contract,
    loginId = $bindable(''),
    password = $bindable(''),
    termsAccepted = $bindable(false),
    minimumAgeConfirmed = $bindable(false),
    ...rest
  }: Props = $props();
</script>

<View {...rest} {contract} messages={messages ?? getAuthMessages(contract.locale)} bind:loginId bind:password bind:termsAccepted bind:minimumAgeConfirmed />
