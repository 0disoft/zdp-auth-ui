import {
  zdpAuthHandoffProductIds,
  zdpAuthHandoffReturnPathRegistry,
  type ZdpAuthHandoffProductId
} from './auth-handoff-registry.generated';

export const zdpAuthHandoffModes = Object.freeze(['login', 'signup'] as const);
export type ZdpAuthHandoffMode = (typeof zdpAuthHandoffModes)[number];
export {
  zdpAuthHandoffProductIds,
  zdpAuthHandoffReturnPathRegistry,
  type ZdpAuthHandoffProductId
};

export interface ZdpAuthHandoffRequest {
  readonly mode: ZdpAuthHandoffMode;
  readonly productId: ZdpAuthHandoffProductId;
  readonly trustedAuthOrigin: string;
  readonly returnPath: string;
}

export type ZdpAuthHandoffRejectionReason =
  | 'invalid-request'
  | 'unsupported-mode'
  | 'invalid-auth-origin'
  | 'untrusted-product'
  | 'invalid-return-path'
  | 'malformed-return-path-encoding'
  | 'noncanonical-return-path'
  | 'unsafe-return-path'
  | 'unregistered-return-path'
  | 'query-too-long';

export type ZdpAuthHandoffResult =
  | {
      readonly outcome: 'created';
      readonly url: string;
    }
  | {
      readonly outcome: 'rejected';
      readonly reason: ZdpAuthHandoffRejectionReason;
    };

const authRouteByMode: Readonly<Record<ZdpAuthHandoffMode, string>> = Object.freeze({
  login: '/login',
  signup: '/signup'
});
const maximumOriginLength = 2_048;
const maximumReturnPathLength = 160;
const maximumQueryLength = 256;
const maximumUrlLength = 2_048;
const controlCharacterPattern = /[\u0000-\u001f\u007f]/u;
const validPercentEncodingPattern = /%(?![0-9A-Fa-f]{2})/u;
const canonicalReturnPathPattern = /^\/[A-Za-z0-9/_-]*$/u;
const absoluteUriPattern = /^[A-Za-z][A-Za-z0-9+.-]*:/u;

export function buildZdpAuthHandoffUrl(request: ZdpAuthHandoffRequest): ZdpAuthHandoffResult {
  if (!request || typeof request !== 'object') {
    return rejected('invalid-request');
  }

  if (!isOneOf(zdpAuthHandoffModes, request.mode)) {
    return rejected('unsupported-mode');
  }

  const trustedAuthOrigin = canonicalHttpsOrigin(request.trustedAuthOrigin);
  if (trustedAuthOrigin === null) {
    return rejected('invalid-auth-origin');
  }

  if (!isOneOf(zdpAuthHandoffProductIds, request.productId)) {
    return rejected('untrusted-product');
  }

  const returnPathRejection = validateReturnPath(request.returnPath);
  if (returnPathRejection !== null) {
    return rejected(returnPathRejection);
  }

  const registeredReturnPaths = zdpAuthHandoffReturnPathRegistry[request.productId];
  if (!registeredReturnPaths.some((registeredPath) => registeredPath === request.returnPath)) {
    return rejected('unregistered-return-path');
  }

  const query = new URLSearchParams([
    ['product_id', request.productId],
    ['return_path', request.returnPath]
  ]).toString();
  const route = authRouteByMode[request.mode];
  const url = `${trustedAuthOrigin}${route}?${query}`;

  if (query.length > maximumQueryLength || url.length > maximumUrlLength) {
    return rejected('query-too-long');
  }

  return { outcome: 'created', url };
}

function canonicalHttpsOrigin(value: string): string | null {
  if (
    typeof value !== 'string'
    || value.length === 0
    || value.length > maximumOriginLength
    || controlCharacterPattern.test(value)
  ) {
    return null;
  }

  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:'
      || url.origin !== value
      || url.pathname !== '/'
      || url.search !== ''
      || url.hash !== ''
      || url.username !== ''
      || url.password !== ''
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

function validateReturnPath(value: string): ZdpAuthHandoffRejectionReason | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > maximumReturnPathLength) {
    return 'invalid-return-path';
  }

  if (validPercentEncodingPattern.test(value)) {
    return 'malformed-return-path-encoding';
  }

  if (value.includes('%')) {
    try {
      decodeURIComponent(value);
    } catch {
      return 'malformed-return-path-encoding';
    }

    return 'noncanonical-return-path';
  }

  if (
    controlCharacterPattern.test(value)
    || value.includes('\\')
    || value.includes('#')
    || value.includes('?')
    || value.includes('&')
    || value.includes('=')
    || absoluteUriPattern.test(value)
    || value.startsWith('//')
    || value.split('/').some((segment) => segment === '.' || segment === '..')
  ) {
    return 'unsafe-return-path';
  }

  if (!canonicalReturnPathPattern.test(value)) {
    return 'unsafe-return-path';
  }

  return null;
}

function rejected(reason: ZdpAuthHandoffRejectionReason): ZdpAuthHandoffResult {
  return { outcome: 'rejected', reason };
}

function isOneOf<const Value extends string>(values: readonly Value[], candidate: unknown): candidate is Value {
  return typeof candidate === 'string' && values.some((value) => value === candidate);
}
