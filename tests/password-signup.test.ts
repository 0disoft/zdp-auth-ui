import { expect, test } from 'bun:test';
import { createZdpPasswordSignupContract } from '../src/lib/password-signup';
import { getAuthMessages, zdpAuthTargetLocales } from '../src/lib/i18n';

test('rejects malformed terms references through the result contract without throwing', () => {
  for (const termsConsentRef of [undefined, null, 42, true, {}, [], '']) {
    expect(createZdpPasswordSignupContract({ termsConsentRef: termsConsentRef as string,
      locale: 'en', minimumAgeYears: 14, agePolicyRef: 'account-minimum-age-14-v1' }))
      .toEqual({ outcome: 'rejected', reason: 'invalid-terms-consent-ref' });
  }
});

test('requires consumer-provided age policy metadata and localized confirmation for every locale', () => {
  const request = { termsConsentRef: 'policy://terms/v1', locale: 'en', minimumAgeYears: 14, agePolicyRef: 'account-minimum-age-14-v1' };
  for (const override of [{ minimumAgeYears: undefined }, { minimumAgeYears: 0 }, { minimumAgeYears: 14.5 }, { minimumAgeYears: NaN },
    { agePolicyRef: undefined }, { agePolicyRef: '' }, { agePolicyRef: 'policy\n' }]) {
    expect(createZdpPasswordSignupContract({ ...request, ...override } as typeof request)).toEqual({ outcome: 'rejected', reason: 'invalid-age-policy' });
  }
  const result = createZdpPasswordSignupContract(request);
  expect(result.outcome).toBe('created');
  if (result.outcome === 'created') {
    expect(result.contract.agePolicyRef).toBe(request.agePolicyRef);
    expect(result.contract.fieldNames.minimumAgeConfirmed).toBe('minimum_age_confirmed');
  }
  for (const locale of zdpAuthTargetLocales) expect(getAuthMessages(locale).fields.minimumAgeConfirmation).toContain('{minimumAge}');
});
