<script lang="ts">
  import {
    AuthShell,
    PasswordField,
    type ZdpAuthFeedback,
    type ZdpAuthFeedbackCode
  } from 'zdp-auth-ui';

  let feedback: ZdpAuthFeedback | null = null;
  let feedbackSequence = 0;
  let password = '';
  let busy = false;
  let legacyStatus = 'Legacy fallback status.';
  let legacyInvalid = true;
  let shellVisible = true;

  function showFeedback(code: ZdpAuthFeedbackCode): void {
    feedbackSequence += 1;
    feedback = { code, sequence: feedbackSequence };
  }
</script>

<section data-testid="typed-auth-feedback-fixture">
  {#if shellVisible}
    <AuthShell
      locale="en"
      mode="login"
      {feedback}
      {busy}
      status={legacyStatus}
      invalid={legacyInvalid}
    >
      <PasswordField
        id="typed-feedback-password"
        name="password"
        bind:value={password}
        locale="en"
        autocomplete="current-password"
      />
    </AuthShell>
  {/if}

  <div>
    <button
      type="button"
      data-testid="show-invalid-credentials"
      onclick={() => showFeedback('invalid_credentials')}
    >Show invalid credentials</button>
    <button
      type="button"
      data-testid="show-rate-limited"
      onclick={() => showFeedback('rate_limited')}
    >Show rate limited</button>
    <button
      type="button"
      data-testid="show-registered"
      onclick={() => showFeedback('registered')}
    >Show registered</button>
    <button type="button" data-testid="show-waiting" onclick={() => showFeedback('waiting')}>
      Show waiting
    </button>
    <button type="button" data-testid="toggle-feedback-shell" onclick={() => (shellVisible = !shellVisible)}>
      Toggle feedback shell
    </button>
    <button type="button" data-testid="clear-feedback" onclick={() => (feedback = null)}>
      Clear feedback
    </button>
    <button type="button" data-testid="queue-typed-error" onclick={() => { busy = true; showFeedback('invalid_credentials'); }}>
      Queue typed error
    </button>
    <button type="button" data-testid="queue-legacy-error" onclick={() => { feedback = null; busy = true; legacyStatus = 'Legacy request failed.'; legacyInvalid = true; }}>
      Queue legacy error
    </button>
    <button type="button" data-testid="release-busy" onclick={() => (busy = false)}>
      Release busy
    </button>
    <button type="button" data-testid="show-legacy-success" onclick={() => { feedback = null; legacyStatus = 'Legacy saved.'; legacyInvalid = false; }}>
      Show legacy success
    </button>
  </div>
</section>
