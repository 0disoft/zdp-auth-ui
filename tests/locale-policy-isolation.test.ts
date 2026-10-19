import { expect, test } from 'bun:test';
import { getAuthMessages, isActiveAuthLocale } from '../src/lib/i18n';
import { zdpAuthActiveLocales, zdpAuthPlannedLocales, zdpAuthTargetLocales } from '../src/lib/i18n/schema';
import { createZdpPasswordSignupContract } from '../src/lib/password-signup';

test('a consumer cannot add a locale that has no catalog to the signup allowlist', () => {
  const length = zdpAuthTargetLocales.length;
  const changed = Reflect.set(zdpAuthTargetLocales, length, 'unreviewed');
  try {
    expect(createZdpPasswordSignupContract({ locale: 'unreviewed', termsConsentRef: 'terms-v1',
      agePolicyRef: 'age-v1', minimumAgeYears: 14 }))
      .toEqual({ outcome: 'rejected', reason: 'unsupported-locale' });
    expect(getAuthMessages('unreviewed')).toBe(getAuthMessages('en'));
    expect(changed).toBe(false);
  } finally {
    if (changed) Reflect.set(zdpAuthTargetLocales, 'length', length);
  }
});

test('a consumer cannot activate an unreviewed locale', () => {
  const length = zdpAuthActiveLocales.length;
  const changed = Reflect.set(zdpAuthActiveLocales, length, 'unreviewed');
  try {
    expect(isActiveAuthLocale('unreviewed')).toBe(false);
    expect(changed).toBe(false);
  } finally {
    if (changed) Reflect.set(zdpAuthActiveLocales, 'length', length);
  }
});

test('planned locale membership cannot be overwritten by a consumer', () => {
  const original = zdpAuthPlannedLocales[0];
  const changed = Reflect.set(zdpAuthPlannedLocales, 0, 'en');
  try {
    expect(zdpAuthPlannedLocales[0]).toBe(original);
    expect(changed).toBe(false);
  } finally {
    if (changed) Reflect.set(zdpAuthPlannedLocales, 0, original);
  }
});
