<script lang="ts">
  import { AuthShell, PasswordField, getAuthMessages } from 'zdp-auth-ui';

  const messages = getAuthMessages('en');
</script>

<section data-testid="dist-auth-shell-fixture">
  <AuthShell locale="en" mode="login">
    <PasswordField
      id="dist-password"
      name="password"
      label={messages.fields.password}
      autocomplete="current-password"
      required
    />
  </AuthShell>
</section>
