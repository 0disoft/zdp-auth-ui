<script lang="ts">
  import {
    AuthShell,
    PasswordField,
    getAuthMessages,
    type ZdpAuthMode,
    type ZdpAuthProvider,
    type ZdpAuthSubmitDetail
  } from 'zdp-auth-ui';

  let mode: ZdpAuthMode = 'login';
  let locale = 'en';
  let password = '';
  let status = '';
  let invalid = false;

  $: messages = getAuthMessages(locale);
  $: providers = buildProviders(messages.providers);

  function buildProviders(labels: ReturnType<typeof getAuthMessages>['providers']): readonly ZdpAuthProvider[] {
    return [
      {
        id: 'passkey',
        kind: 'passkey',
        label: labels.passkey
      },
      {
        id: 'google',
        kind: 'oauth',
        label: labels.google
      },
      {
        id: 'email',
        kind: 'email',
        label: labels.email
      }
    ];
  }

  function handleSubmit(detail: ZdpAuthSubmitDetail): void {
    invalid = false;
    status = detail.mode === 'recovery' ? messages.status.waiting : '';
  }
</script>

<section class="clean-consumer" aria-labelledby="clean-consumer-title">
  <h2 id="clean-consumer-title">Clean consumer fixture</h2>
  <AuthShell
    {locale}
    {mode}
    {providers}
    {status}
    {invalid}
    termsHref="/terms"
    privacyHref="/privacy"
    onsubmit={handleSubmit}
    onmodechange={(detail) => {
      mode = detail.mode;
      status = '';
    }}
    onproviderselect={() => {
      status = messages.status.waiting;
    }}
  >
    <PasswordField
      id="clean-consumer-password"
      name="password"
      bind:value={password}
      {locale}
      autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
      helpText={mode === 'signup' ? 'Use a password you do not use anywhere else.' : null}
      errorText={invalid ? messages.status.error : null}
      required
    />
  </AuthShell>
</section>

<style>
  .clean-consumer {
    display: grid;
    gap: var(--zdp-space-4);
    max-width: 32rem;
    min-width: 0;
  }

  .clean-consumer h2 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-font-size-lg);
    line-height: var(--zdp-font-line-height-tight);
    margin: 0;
  }
</style>
