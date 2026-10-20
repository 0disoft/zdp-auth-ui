<script lang="ts">
  import AuthShell from '../../../src/lib/components/AuthShell.svelte';
  import { messages } from '../../../src/lib/i18n/en';
  import type { ZdpAuthMode } from '../../../src/lib/auth-contract';

  let mode: ZdpAuthMode = $state('signup');
  let referralCode = $state<string | null>('  invitation  ');
  let referralCodeFieldName = $state('referral_code');
  let result = $state('');

  export function update(nextMode: ZdpAuthMode, code: string | null, fieldName = 'referral_code') {
    mode = nextMode;
    referralCode = code;
    referralCodeFieldName = fieldName;
  }
</script>

<section data-testid="auth-shell-transitions">
  <AuthShell {messages} {mode} {referralCode} {referralCodeFieldName}
    onsubmit={({ mode, form, referralCode }) => {
      result = JSON.stringify({ mode, referralCode, fields: [...new FormData(form).entries()] });
    }} />
  <output>{result}</output>
</section>
