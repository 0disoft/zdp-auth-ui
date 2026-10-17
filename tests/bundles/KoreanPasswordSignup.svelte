<script lang="ts">
  import { AuthShell, PasswordSignupFields } from 'zdp-auth-ui/components';
  import { locale, messages } from 'zdp-auth-ui/i18n/ko';
  import { createZdpPasswordSignupContract } from 'zdp-auth-ui/contract';

  const result = createZdpPasswordSignupContract({
    locale,
    termsConsentRef: 'signup-bundle-terms-v1',
    agePolicyRef: 'signup-bundle-age-v1',
    minimumAgeYears: 14
  });
  if (result.outcome !== 'created') throw new Error('Signup bundle fixture contract was rejected.');
  const contract = result.contract;
</script>

<AuthShell {locale} {messages} mode="signup" termsHref="https://example.test/terms" signupTermsInSlot>
  <PasswordSignupFields {messages} {contract} idPrefix="bundle-signup" />
</AuthShell>
