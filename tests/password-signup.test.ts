import { expect, test } from 'bun:test';
import { createZdpPasswordSignupContract, zdpPasswordSignupFieldNames } from '../src/lib/password-signup';
import { getAuthMessages, zdpAuthTargetLocales } from '../src/lib/i18n';

test('returns stable form field names and rejects unsupported locales', () => {
  const request = { termsConsentRef: 'policy://terms/v1', locale: 'en',
    minimumAgeYears: 14, agePolicyRef: 'account-minimum-age-14-v1' };
  const result = createZdpPasswordSignupContract(request);
  expect(result.outcome).toBe('created');
  if (result.outcome === 'created') {
    expect(result.contract.fieldNames).toBe(zdpPasswordSignupFieldNames);
    expect(result.contract.fieldNames).toEqual({ loginId: 'login_id', password: 'password',
      termsAccepted: 'terms_accepted', termsConsentRef: 'terms_consent_ref',
      minimumAgeConfirmed: 'minimum_age_confirmed', agePolicyRef: 'age_policy_ref', locale: 'locale' });
  }
  expect(createZdpPasswordSignupContract({ ...request, locale: 'unsupported' }))
    .toEqual({ outcome: 'rejected', reason: 'unsupported-locale' });
});

test('rejects non-object signup requests without throwing', () => {
  for (const request of [null, undefined, 42, true, 'policy://terms/v1', []]) {
    expect(createZdpPasswordSignupContract(request as unknown as Parameters<typeof createZdpPasswordSignupContract>[0]))
      .toEqual({ outcome: 'rejected', reason: 'invalid-terms-consent-ref' });
  }
});

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
    { agePolicyRef: undefined }, { agePolicyRef: null }, { agePolicyRef: 42 },
    { agePolicyRef: '' }, { agePolicyRef: ' \t\n' }, { agePolicyRef: 'policy\nref' }]) {
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

test('normalizes both policy references before validating and storing them', () => {
  const request = {
    termsConsentRef: ' \tpolicy://terms/v1\n', agePolicyRef: '\n account-minimum-age-14-v1 \t',
    minimumAgeYears: 14, locale: 'en'
  };
  const result = createZdpPasswordSignupContract(request);
  expect(result.outcome).toBe('created');
  if (result.outcome === 'created') {
    expect(result.contract.termsConsentRef).toBe('policy://terms/v1');
    expect(result.contract.agePolicyRef).toBe('account-minimum-age-14-v1');
  }
  expect(request.agePolicyRef).toBe('\n account-minimum-age-14-v1 \t');
});
