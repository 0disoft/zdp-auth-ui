import { expect, test } from 'bun:test';
import { validateProductLinkRequest, type ZdpProductLinkRequest, type ZdpProductLinkTrustPolicy } from '../src/lib/product-link';

test('invalid product link results do not share mutable validation state', () => {
  const request = null as unknown as ZdpProductLinkRequest;
  const trust = null as unknown as ZdpProductLinkTrustPolicy;
  const first = validateProductLinkRequest(request, trust);
  Object.assign(first, { disposition: 'ready', actionable: true });
  const second = validateProductLinkRequest(request, trust);
  expect(second).toEqual({ disposition: 'invalid', actionable: false });
  expect(second).not.toBe(first);
});
test('rejects holes in required approval display arrays', () => {
  const now = new Date('2026-01-01T00:01:00Z');
  const request: ZdpProductLinkRequest = {
    challengeRef: 'challenge', verificationUri: 'https://account.example/link?challenge=challenge',
    state: 'pending', productLabel: 'Product', accountLabel: 'Account', workspaceLabel: null,
    requestedItems: [{ ref: 'read', kind: 'scope', label: 'Read', description: 'Read content' }],
    consentImplications: ['Read content'], issuedAt: '2026-01-01T00:00:00Z',
    expiresAt: '2026-01-01T00:05:00Z'
  };
  const trust: ZdpProductLinkTrustPolicy = {
    expectedChallengeRef: 'challenge', expectedVerificationUri: request.verificationUri,
    allowedVerificationOrigins: ['https://account.example'], verificationPath: '/link', maxRequestAgeMs: 300_000
  };
  expect(validateProductLinkRequest(request, trust, now).actionable).toBe(true);
  for (const field of ['requestedItems', 'consentImplications'] as const) {
    const malformed = { ...request, [field]: Array(1) };
    expect(validateProductLinkRequest(malformed, trust, now)).toEqual({ disposition: 'invalid', actionable: false });
  }
  expect(validateProductLinkRequest(request, { ...trust, allowedVerificationOrigins: Array(1) }, now).actionable).toBe(false);
});
