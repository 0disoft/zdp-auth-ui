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

  function showFeedback(code: ZdpAuthFeedbackCode): void {
    feedbackSequence += 1;
    feedback = { code, sequence: feedbackSequence };
  }
</script>

<section data-testid="typed-auth-feedback-fixture">
  <AuthShell
    locale="en"
    mode="login"
    {feedback}
    status="Legacy fallback status."
    invalid
  >
    <PasswordField
      id="typed-feedback-password"
      name="password"
      bind:value={password}
      locale="en"
      autocomplete="current-password"
    />
  </AuthShell>

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
    <button type="button" data-testid="clear-feedback" onclick={() => (feedback = null)}>
      Clear feedback
    </button>
  </div>
</section>
