<script lang="ts">
  import AuthShell from '../../../src/lib/components/AuthShell.svelte';
  import PasswordField from '../../../src/lib/components/PasswordField.svelte';

  let password = '';
  let submitCount = 0;
</script>

<main>
  <AuthShell
    locale="en"
    mode="login"
    onsubmit={() => {
      submitCount += 1;
    }}
  >
    <PasswordField
      id="browser-password"
      name="password"
      bind:value={password}
      locale="en"
      autocomplete="current-password"
      required
    />
  </AuthShell>
  <output data-testid="submit-count">{submitCount}</output>
</main>
