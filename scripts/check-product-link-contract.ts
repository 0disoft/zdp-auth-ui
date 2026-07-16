import assert from 'node:assert/strict';
import {
  validateProductLinkRequest,
  type ZdpProductLinkRequest,
  type ZdpProductLinkTrustPolicy
} from '../src/lib/product-link';

const now = new Date('2026-07-15T04:05:00.000Z');
const challengeRef = 'plc_browser_fixture_0123456789';
const verificationOrigin = 'https://accounts.zdp.example';
const trust: ZdpProductLinkTrustPolicy = {
  expectedChallengeRef: challengeRef,
  expectedVerificationUri: `${verificationOrigin}/auth/product-link?challenge=${challengeRef}`,
  allowedVerificationOrigins: [verificationOrigin],
  verificationPath: '/auth/product-link',
  maxRequestAgeMs: 120_000
};
const request: ZdpProductLinkRequest = {
  challengeRef,
  verificationUri: `${verificationOrigin}/auth/product-link?challenge=${challengeRef}`,
  state: 'pending',
  productLabel: 'Talos Desktop',
  requestedItems: [
    {
      ref: 'workspace_read_012345',
      kind: 'scope',
      label: 'Workspace identity',
      description: 'Use the selected workspace reference for this connection.'
    },
    {
      ref: 'remote_sync_01234567',
      kind: 'capability',
      label: 'Remote account features',
      description: 'Enable account-backed features after the product verifies the link receipt.'
    }
  ],
  accountLabel: 'Signed-in ZDP account',
  workspaceLabel: 'Personal workspace',
  consentImplications: [
    'The product receives opaque account and consent references.',
    'Product data stays local unless you approve a separate sync flow.'
  ],
  issuedAt: '2026-07-15T04:04:00.000Z',
  expiresAt: '2026-07-15T04:14:00.000Z'
};

assert.deepEqual(
  validateProductLinkRequest(request, trust, now),
  { disposition: 'ready', actionable: true },
  'A fresh pending request on the exact trusted HTTPS route must be actionable.'
);

const shortChallengeRef = 'x';
const shortVerificationUri = `${verificationOrigin}/auth/product-link?challenge=${shortChallengeRef}`;
assert.deepEqual(
  validateProductLinkRequest(
    { ...request, challengeRef: shortChallengeRef, verificationUri: shortVerificationUri },
    { ...trust, expectedChallengeRef: shortChallengeRef, expectedVerificationUri: shortVerificationUri },
    now
  ),
  { disposition: 'ready', actionable: true },
  'A short bounded opaque challenge reference must remain valid when it exactly matches trusted context.'
);

assertClosed(
  { ...request, challengeRef: 'plc_unexpected_fixture_0123456' },
  trust,
  'invalid',
  'A challenge that does not match the trusted browser context must fail closed.'
);
assertClosed(
  { ...request, verificationUri: `http://accounts.zdp.example/auth/product-link?challenge=${challengeRef}` },
  { ...trust, expectedVerificationUri: `http://accounts.zdp.example/auth/product-link?challenge=${challengeRef}` },
  'invalid',
  'A non-HTTPS verification URI must fail closed.'
);
assertClosed(
  { ...request, verificationUri: `https://lookalike.example/auth/product-link?challenge=${challengeRef}` },
  { ...trust, expectedVerificationUri: `https://lookalike.example/auth/product-link?challenge=${challengeRef}` },
  'invalid',
  'A verification URI on a different origin must fail closed.'
);
const redirectVerificationUri = `${verificationOrigin}/auth/product-link?challenge=${challengeRef}&redirect=https%3A%2F%2Fevil.example`;
assertClosed(
  { ...request, verificationUri: redirectVerificationUri },
  { ...trust, expectedVerificationUri: redirectVerificationUri },
  'invalid',
  'Extra redirect or callback parameters must fail closed.'
);
assertClosed(
  { ...request, verificationUri: `${verificationOrigin}/auth/product-link?challenge=plc_other_fixture_0123456789` },
  { ...trust, expectedVerificationUri: `${verificationOrigin}/auth/product-link?challenge=plc_other_fixture_0123456789` },
  'invalid',
  'A verification URI bound to another challenge must fail closed.'
);
const verifierBearingVerificationUri = `${verificationOrigin}/auth/product-link?challenge=${challengeRef}&proof_verifier=present`;
assertClosed(
  { ...request, verificationUri: verifierBearingVerificationUri },
  { ...trust, expectedVerificationUri: verifierBearingVerificationUri },
  'invalid',
  'A verification URI carrying verifier material must fail closed.'
);
assertClosed(
  { ...request, issuedAt: '2026-07-15T04:00:00.000Z', expiresAt: '2026-07-15T04:10:00.000Z' },
  trust,
  'stale',
  'A stale pending request must fail closed.'
);
assertClosed(
  { ...request, expiresAt: '2026-07-15T04:05:00.000Z' },
  trust,
  'expired',
  'An expired request must fail closed.'
);
assertClosed(
  { ...request, expiresAt: '2026-07-15T04:15:00.001Z' },
  trust,
  'invalid',
  'A request longer than the ten-minute contract TTL must fail closed.'
);

for (const state of ['approved', 'denied', 'consumed'] as const) {
  assertClosed(
    { ...request, state },
    trust,
    state,
    `A ${state} request must never expose approval controls.`
  );
}

console.log('Product-link contract check passed.');

function assertClosed(
  candidate: ZdpProductLinkRequest,
  policy: ZdpProductLinkTrustPolicy,
  disposition: ReturnType<typeof validateProductLinkRequest>['disposition'],
  message: string
): void {
  assert.deepEqual(
    validateProductLinkRequest(candidate, policy, now),
    { disposition, actionable: false },
    message
  );
}
