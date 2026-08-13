export const zdpProductLinkStates = ['pending', 'approved', 'denied', 'expired', 'consumed'] as const;
export const zdpProductLinkItemKinds = ['scope', 'capability'] as const;
export const zdpProductLinkDecisions = ['approve', 'deny'] as const;

export type ZdpProductLinkState = (typeof zdpProductLinkStates)[number];
export type ZdpProductLinkItemKind = (typeof zdpProductLinkItemKinds)[number];
export type ZdpProductLinkDecision = (typeof zdpProductLinkDecisions)[number];

export interface ZdpProductLinkRequestedItem {
  readonly ref: string;
  readonly kind: ZdpProductLinkItemKind;
  readonly label: string;
  readonly description: string;
}

export interface ZdpProductLinkRequest {
  readonly challengeRef: string;
  readonly verificationUri: string;
  readonly state: ZdpProductLinkState;
  readonly productLabel: string;
  readonly requestedItems: readonly ZdpProductLinkRequestedItem[];
  readonly accountLabel: string;
  readonly workspaceLabel: string | null;
  readonly consentImplications: readonly string[];
  readonly issuedAt: string;
  readonly expiresAt: string;
}

export interface ZdpProductLinkTrustPolicy {
  readonly expectedChallengeRef: string;
  readonly expectedVerificationUri: string;
  readonly allowedVerificationOrigins: readonly string[];
  readonly verificationPath: string;
  readonly maxRequestAgeMs: number;
}

export type ZdpProductLinkDisposition =
  | 'ready'
  | 'approved'
  | 'denied'
  | 'expired'
  | 'consumed'
  | 'stale'
  | 'invalid';

export interface ZdpProductLinkValidation {
  readonly disposition: ZdpProductLinkDisposition;
  readonly actionable: boolean;
}

export interface ZdpProductLinkDecisionDetail {
  readonly challengeRef: string;
  readonly decision: ZdpProductLinkDecision;
}

const displayTextMaxLength = 200;
const detailTextMaxLength = 500;
const maximumRequestedItems = 32;
const maximumConsentImplications = 16;
const maximumChallengeTtlMs = 600_000;
const forbiddenVerificationQueryConcepts = [
  'authorization',
  'callback',
  'continue',
  'cookie',
  'next',
  'proof',
  'redirect',
  'return',
  'session',
  'token',
  'verifier'
] as const;

/*
 * mf:anchor zdp.auth-ui.product-link-trust-boundary
 * purpose: Validate the browser-side desktop product-link request before approval controls become actionable.
 * search: product link, challenge trust, verification URI, approval, deny, fail closed
 * invariant: Only an expected opaque challenge on an allowlisted HTTPS verification route can become actionable; redirects and terminal or stale requests fail closed.
 * risk: authn, authz, privacy, security
 */
export function validateProductLinkRequest(
  request: ZdpProductLinkRequest,
  trust: ZdpProductLinkTrustPolicy,
  now: Date = new Date()
): ZdpProductLinkValidation {
  if (!isValidTrustPolicy(trust) || !isValidRequestShape(request)) {
    return invalidValidation;
  }

  if (request.challengeRef !== trust.expectedChallengeRef) {
    return invalidValidation;
  }

  if (!isTrustedVerificationUri(request.verificationUri, trust)) {
    return invalidValidation;
  }

  const nowMs = now.getTime();
  const issuedAtMs = Date.parse(request.issuedAt);
  const expiresAtMs = Date.parse(request.expiresAt);
  if (!Number.isFinite(nowMs) || !Number.isFinite(issuedAtMs) || !Number.isFinite(expiresAtMs)) {
    return invalidValidation;
  }

  if (expiresAtMs <= issuedAtMs || expiresAtMs - issuedAtMs > maximumChallengeTtlMs) {
    return invalidValidation;
  }

  if (expiresAtMs <= nowMs || request.state === 'expired') {
    return { disposition: 'expired', actionable: false };
  }

  if (request.state === 'denied' || request.state === 'consumed' || request.state === 'approved') {
    return { disposition: request.state, actionable: false };
  }

  if (issuedAtMs > nowMs + 30_000 || nowMs - issuedAtMs > trust.maxRequestAgeMs) {
    return { disposition: 'stale', actionable: false };
  }

  return { disposition: 'ready', actionable: true };
}

function isValidTrustPolicy(trust: ZdpProductLinkTrustPolicy): boolean {
  return Boolean(trust)
    && typeof trust.expectedChallengeRef === 'string'
    && isBoundedOpaqueReference(trust.expectedChallengeRef)
    && Number.isSafeInteger(trust.maxRequestAgeMs)
    && trust.maxRequestAgeMs > 0
    && trust.maxRequestAgeMs <= maximumChallengeTtlMs
    && isSafeVerificationPath(trust.verificationPath)
    && Array.isArray(trust.allowedVerificationOrigins)
    && trust.allowedVerificationOrigins.length > 0
    && trust.allowedVerificationOrigins.every(isCanonicalHttpsOrigin);
}

function isValidRequestShape(request: ZdpProductLinkRequest): boolean {
  return Boolean(request)
    && typeof request.challengeRef === 'string'
    && isBoundedOpaqueReference(request.challengeRef)
    && typeof request.verificationUri === 'string'
    && (zdpProductLinkStates as readonly string[]).includes(request.state)
    && isBoundedText(request.productLabel, displayTextMaxLength)
    && isBoundedText(request.accountLabel, displayTextMaxLength)
    && (request.workspaceLabel === null || isBoundedText(request.workspaceLabel, displayTextMaxLength))
    && isIsoTimestamp(request.issuedAt)
    && isIsoTimestamp(request.expiresAt)
    && Array.isArray(request.requestedItems)
    && request.requestedItems.length > 0
    && request.requestedItems.length <= maximumRequestedItems
    && request.requestedItems.every(isValidRequestedItem)
    && new Set(request.requestedItems.map((item) => item.ref)).size === request.requestedItems.length
    && Array.isArray(request.consentImplications)
    && request.consentImplications.length > 0
    && request.consentImplications.length <= maximumConsentImplications
    && request.consentImplications.every((item) => isBoundedText(item, detailTextMaxLength));
}

function isValidRequestedItem(item: ZdpProductLinkRequestedItem): boolean {
  return Boolean(item)
    && typeof item.ref === 'string'
    && isBoundedText(item.ref, displayTextMaxLength)
    && (zdpProductLinkItemKinds as readonly string[]).includes(item.kind)
    && isBoundedText(item.label, displayTextMaxLength)
    && isBoundedText(item.description, detailTextMaxLength);
}

function isTrustedVerificationUri(
  value: string,
  trust: ZdpProductLinkTrustPolicy
): boolean {
  if (
    typeof value !== 'string'
    || typeof trust.expectedVerificationUri !== 'string'
    || value !== trust.expectedVerificationUri
    || value.length > 2_048
  ) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (
    url.protocol !== 'https:'
    || url.username !== ''
    || url.password !== ''
    || url.hash !== ''
    || url.pathname !== trust.verificationPath
    || !trust.allowedVerificationOrigins.includes(url.origin)
  ) {
    return false;
  }

  return [...url.searchParams.keys()].every(isSafeVerificationQueryKey)
    && isChallengeQueryBound(url, trust.expectedChallengeRef);
}

function isSafeVerificationQueryKey(key: string): boolean {
  const normalizedKey = key.toLowerCase().replaceAll(/[^a-z0-9]/g, '');
  return forbiddenVerificationQueryConcepts.every((concept) => !normalizedKey.includes(concept));
}

function isChallengeQueryBound(url: URL, challengeRef: string): boolean {
  const values = url.searchParams.getAll('challenge');
  return values.length === 0 || (values.length === 1 && values[0] === challengeRef);
}

function isCanonicalHttpsOrigin(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && url.origin === value
      && url.pathname === '/'
      && url.search === ''
      && url.hash === ''
      && url.username === ''
      && url.password === '';
  } catch {
    return false;
  }
}

function isSafeVerificationPath(value: string): boolean {
  return typeof value === 'string'
    && /^\/[A-Za-z0-9/_-]+$/.test(value)
    && !value.includes('//')
    && !value.includes('..');
}

function isIsoTimestamp(value: string): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) {
    return false;
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const canonical = new Date(timestamp).toISOString();
  return value === canonical || value === canonical.replace('.000Z', 'Z');
}

function isBoundedOpaqueReference(value: string): boolean {
  return typeof value === 'string'
    && value.length >= 1
    && value.length <= 160
    && !/[\s\u0000-\u001f\u007f]/u.test(value);
}

function isBoundedText(value: string, maxLength: number): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength && !/[\u0000-\u001f\u007f]/.test(trimmed);
}

const invalidValidation: ZdpProductLinkValidation = {
  disposition: 'invalid',
  actionable: false
};
