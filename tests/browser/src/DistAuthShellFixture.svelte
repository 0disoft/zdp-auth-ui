<script lang="ts">
  import { AuthShell, PasswordField } from 'zdp-auth-ui/components';
  import { locale, messages } from 'zdp-auth-ui/i18n/en';
  import { loadAuthLocale } from 'zdp-auth-ui/i18n/loader';

  let catalog = { locale: locale as string, messages };
</script>

<section data-testid="dist-auth-shell-fixture">
  <AuthShell locale={catalog.locale} messages={catalog.messages} mode="login">
    <PasswordField
      id="dist-password"
      name="password"
      locale={catalog.locale}
      messages={catalog.messages}
      autocomplete="current-password"
      required
    />
  </AuthShell>
  <button type="button" onclick={async () => { catalog = await loadAuthLocale('ko'); }}>Load Korean</button>
</section>
