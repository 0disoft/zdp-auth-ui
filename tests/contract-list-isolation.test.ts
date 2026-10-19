import { expect, test } from 'bun:test';
import { isZdpAuthFeedbackCode, isZdpAuthFeedbackErrorCode,
  zdpAuthFeedbackCodes, zdpAuthFeedbackErrorCodes } from '../src/lib/auth-contract';
import { isZdpPasskeyAuthenticatorProvider, isZdpPasskeyAuthenticatorStorage,
  isZdpPasskeyRegistrationPreference, zdpPasskeyAuthenticatorProviders,
  zdpPasskeyAuthenticatorStorages, zdpPasskeyRegistrationPreferences } from '../src/lib/passkey-settings-contract';
import { validateProductLinkRequest, zdpProductLinkItemKinds, zdpProductLinkStates,
  type ZdpProductLinkRequest, type ZdpProductLinkTrustPolicy } from '../src/lib/product-link';

for (const [name, values, guard] of [
  ['feedback codes', zdpAuthFeedbackCodes, isZdpAuthFeedbackCode],
  ['error codes', zdpAuthFeedbackErrorCodes, isZdpAuthFeedbackErrorCode],
  ['authenticator providers', zdpPasskeyAuthenticatorProviders, isZdpPasskeyAuthenticatorProvider],
  ['authenticator storage', zdpPasskeyAuthenticatorStorages, isZdpPasskeyAuthenticatorStorage],
  ['registration preferences', zdpPasskeyRegistrationPreferences, isZdpPasskeyRegistrationPreference]
] as const) {
  test(`consumer mutation cannot extend accepted ${name}`, () => {
    const length = values.length;
    const supported = [...values];
    const changed = Reflect.set(values, length, 'unreviewed');
    try {
      expect(guard('unreviewed')).toBe(false);
      expect(supported.every(value => guard(value))).toBe(true);
      expect(changed).toBe(false);
    } finally {
      if (changed) Reflect.set(values, 'length', length);
    }
  });
}

test('mutating exported product-link enums cannot make malformed requests actionable', () => {
  const now = new Date('2026-01-01T00:01:00Z');
  const request: ZdpProductLinkRequest = {
    challengeRef: 'challenge', verificationUri: 'https://account.example/link?challenge=challenge',
    state: 'pending', productLabel: 'Product', accountLabel: 'Account', workspaceLabel: null,
    requestedItems: [{ ref: 'read', kind: 'scope', label: 'Read', description: 'Read content' }],
    consentImplications: ['Read content'], issuedAt: '2026-01-01T00:00:00Z', expiresAt: '2026-01-01T00:05:00Z'
  };
  const trust: ZdpProductLinkTrustPolicy = {
    expectedChallengeRef: 'challenge', expectedVerificationUri: request.verificationUri,
    allowedVerificationOrigins: ['https://account.example'], verificationPath: '/link', maxRequestAgeMs: 300_000
  };
  expect(validateProductLinkRequest(request, trust, now).actionable).toBe(true);
  for (const [values, malformed] of [
    [zdpProductLinkStates, { ...request, state: 'unreviewed' }],
    [zdpProductLinkItemKinds, { ...request, requestedItems: [{ ...request.requestedItems[0], kind: 'unreviewed' }] }]
  ] as const) {
    const length = values.length;
    const changed = Reflect.set(values, length, 'unreviewed');
    try {
      expect(validateProductLinkRequest(malformed as ZdpProductLinkRequest, trust, now))
        .toEqual({ disposition: 'invalid', actionable: false });
      expect(changed).toBe(false);
    } finally {
      if (changed) Reflect.set(values, 'length', length);
    }
  }
});
