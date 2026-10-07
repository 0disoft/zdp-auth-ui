import {
  WebAuthnAbortService,
  WebAuthnError,
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
  platformAuthenticatorIsAvailable,
  startAuthentication,
  startRegistration
} from '@simplewebauthn/browser';
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON
} from '@simplewebauthn/browser';

export const zdpPasskeyCeremonyKinds = ['authentication', 'registration'] as const;
export type ZdpPasskeyCeremonyKind = (typeof zdpPasskeyCeremonyKinds)[number];

export const zdpPasskeyAuthenticationMediationModes = ['modal', 'conditional'] as const;
export type ZdpPasskeyAuthenticationMediation =
  (typeof zdpPasskeyAuthenticationMediationModes)[number];

export const zdpPasskeyErrorReasons = [
  'unsupported',
  'conditional-ui-unsupported',
  'conditional-input-missing',
  'cancelled',
  'timed-out',
  'not-allowed',
  'security-error',
  'invalid-options',
  'authenticator-error',
  'unknown'
] as const;
export type ZdpPasskeyErrorReason = (typeof zdpPasskeyErrorReasons)[number];

export interface ZdpPasskeySupport {
  readonly supported: boolean;
  readonly conditionalUi: boolean;
  readonly platformAuthenticator: boolean;
}

export interface ZdpPasskeyCeremonyOptions {
  readonly timeoutMs?: number;
}

export interface ZdpPasskeyAuthenticationOptions extends ZdpPasskeyCeremonyOptions {
  readonly mediation?: ZdpPasskeyAuthenticationMediation;
  readonly verifyBrowserAutofillInput?: boolean;
}

export class ZdpPasskeyCeremonyError extends Error {
  override readonly name = 'ZdpPasskeyCeremonyError';
  readonly reason: ZdpPasskeyErrorReason;
  readonly ceremony: ZdpPasskeyCeremonyKind;

  constructor(
    ceremony: ZdpPasskeyCeremonyKind,
    reason: ZdpPasskeyErrorReason,
    cause?: unknown
  ) {
    super(passkeyErrorMessage(reason), { cause });
    this.ceremony = ceremony;
    this.reason = reason;
  }
}

const minimumCeremonyTimeoutMs = 1_000;
const maximumCeremonyTimeoutMs = 600_000;
const capabilityProbeTimeoutMs = 1_000;
let activeCeremony: { readonly controller: AbortController; readonly ceremony: ZdpPasskeyCeremonyKind } | null = null;

/*
 * mf:anchor zdp.auth-ui.passkey-browser-ceremony
 * purpose: Locate passkey capability detection and browser ceremony helpers shared by auth surfaces.
 * search: passkey, WebAuthn, conditional UI, browser autofill, ceremony cancellation, ceremony timeout
 * invariant: Helpers may probe or start browser ceremonies only; challenge creation, verification, session issue, and credential storage stay server-owned.
 * risk: authn, privacy
 */
export async function detectPasskeySupport(): Promise<ZdpPasskeySupport> {
  const supported = browserSupportsWebAuthn();
  if (!supported) {
    return {
      supported: false,
      conditionalUi: false,
      platformAuthenticator: false
    };
  }

  const [conditionalUi, platformAuthenticator] = await Promise.all([
    safeCapabilityProbe(browserSupportsWebAuthnAutofill),
    safeCapabilityProbe(platformAuthenticatorIsAvailable)
  ]);

  return { supported, conditionalUi, platformAuthenticator };
}

export async function startPasskeyRegistration(
  options: PublicKeyCredentialCreationOptionsJSON,
  ceremonyOptions: ZdpPasskeyCeremonyOptions = {}
): Promise<RegistrationResponseJSON> {
  ensurePasskeySupported('registration');
  const timeoutMs = validateTimeout('registration', ceremonyOptions.timeoutMs);

  return runPasskeyCeremony(
    'registration',
    timeoutMs,
    (assertActive) => { assertActive(); return startRegistration({ optionsJSON: options }); }
  );
}

export async function startPasskeyAuthentication(
  options: PublicKeyCredentialRequestOptionsJSON,
  ceremonyOptions: ZdpPasskeyAuthenticationOptions = {}
): Promise<AuthenticationResponseJSON> {
  ensurePasskeySupported('authentication');
  const timeoutMs = validateTimeout('authentication', ceremonyOptions.timeoutMs);
  const mediation = ceremonyOptions.mediation ?? 'modal';
  const useBrowserAutofill = mediation === 'conditional';

  return runPasskeyCeremony('authentication', timeoutMs, async (assertActive) => {
  if (useBrowserAutofill) {
    const conditionalUi = await safeCapabilityProbe(browserSupportsWebAuthnAutofill);
    assertActive();
    if (!conditionalUi) {
      throw new ZdpPasskeyCeremonyError(
        'authentication',
        'conditional-ui-unsupported'
      );
    }

    const verifyBrowserAutofillInput = ceremonyOptions.verifyBrowserAutofillInput ?? true;
    if (verifyBrowserAutofillInput && !hasBrowserAutofillInput()) {
      throw new ZdpPasskeyCeremonyError(
        'authentication',
        'conditional-input-missing'
      );
    }
  }

  assertActive();
  return startAuthentication({
      optionsJSON: options,
      useBrowserAutofill,
      verifyBrowserAutofillInput: ceremonyOptions.verifyBrowserAutofillInput
    });
  });
}

export function cancelPasskeyCeremony(): void {
  if (activeCeremony) {
    activeCeremony.controller.abort(new ZdpPasskeyCeremonyError(activeCeremony.ceremony, 'cancelled'));
    activeCeremony = null;
  }
  WebAuthnAbortService.cancelCeremony();
}

async function safeCapabilityProbe(probe: () => Promise<boolean>): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([probe(), new Promise<boolean>(resolve => {
      timer = setTimeout(() => resolve(false), capabilityProbeTimeoutMs);
    })]);
  } catch {
    return false;
  } finally { clearTimeout(timer); }
}

function ensurePasskeySupported(ceremony: ZdpPasskeyCeremonyKind): void {
  if (!browserSupportsWebAuthn()) {
    throw new ZdpPasskeyCeremonyError(ceremony, 'unsupported');
  }
}

function validateTimeout(
  ceremony: ZdpPasskeyCeremonyKind,
  timeoutMs: number | undefined
): number | null {
  if (timeoutMs === undefined) {
    return null;
  }

  if (
    !Number.isSafeInteger(timeoutMs)
    || timeoutMs < minimumCeremonyTimeoutMs
    || timeoutMs > maximumCeremonyTimeoutMs
  ) {
    throw new ZdpPasskeyCeremonyError(ceremony, 'invalid-options');
  }

  return timeoutMs;
}

function hasBrowserAutofillInput(): boolean {
  return typeof document !== 'undefined'
    && document.querySelector("input[autocomplete$='webauthn']") !== null;
}

async function runPasskeyCeremony<Response>(
  ceremony: ZdpPasskeyCeremonyKind,
  timeoutMs: number | null,
  start: (assertActive: () => void) => Promise<Response>
): Promise<Response> {
  cancelPasskeyCeremony();
  const current = { controller: new AbortController(), ceremony };
  activeCeremony = current;
  const assertActive = () => {
    if (current.controller.signal.aborted) throw current.controller.signal.reason;
  };
  let timedOut = false;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let rejectCancellation!: () => void;
  const cancelled = new Promise<never>((_, reject) => {
    rejectCancellation = () => reject(current.controller.signal.reason);
    current.controller.signal.addEventListener('abort', rejectCancellation, { once: true });
  });

  if (timeoutMs !== null) {
    timeout = setTimeout(() => {
      timedOut = true;
      current.controller.abort(new ZdpPasskeyCeremonyError(ceremony, 'timed-out'));
      if (activeCeremony === current) WebAuthnAbortService.cancelCeremony();
    }, timeoutMs);
  }

  try {
    return await Promise.race([start(assertActive), cancelled]);
  } catch (error) {
    throw normalizePasskeyError(ceremony, error, timedOut);
  } finally {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    current.controller.signal.removeEventListener('abort', rejectCancellation);
    if (activeCeremony === current) activeCeremony = null;
  }
}

function normalizePasskeyError(
  ceremony: ZdpPasskeyCeremonyKind,
  error: unknown,
  timedOut: boolean
): ZdpPasskeyCeremonyError {
  if (error instanceof ZdpPasskeyCeremonyError) {
    return error;
  }

  if (timedOut) {
    return new ZdpPasskeyCeremonyError(ceremony, 'timed-out', error);
  }

  if (error instanceof WebAuthnError) {
    switch (error.code) {
      case 'ERROR_CEREMONY_ABORTED':
        return new ZdpPasskeyCeremonyError(ceremony, 'cancelled', error);
      case 'ERROR_INVALID_DOMAIN':
      case 'ERROR_INVALID_RP_ID':
      case 'ERROR_INVALID_USER_ID_LENGTH':
      case 'ERROR_MALFORMED_PUBKEYCREDPARAMS':
        return new ZdpPasskeyCeremonyError(ceremony, 'invalid-options', error);
      case 'ERROR_AUTHENTICATOR_GENERAL_ERROR':
      case 'ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT':
      case 'ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT':
      case 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED':
      case 'ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG':
      case 'ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE':
        return new ZdpPasskeyCeremonyError(ceremony, 'authenticator-error', error);
      case 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY':
        break;
    }
  }

  const errorName = error instanceof Error ? error.name : '';
  switch (errorName) {
    case 'AbortError':
      return new ZdpPasskeyCeremonyError(ceremony, 'cancelled', error);
    case 'NotAllowedError':
      return new ZdpPasskeyCeremonyError(ceremony, 'not-allowed', error);
    case 'NotSupportedError':
      return new ZdpPasskeyCeremonyError(ceremony, 'unsupported', error);
    case 'SecurityError':
      return new ZdpPasskeyCeremonyError(ceremony, 'security-error', error);
    case 'ConstraintError':
    case 'InvalidStateError':
    case 'UnknownError':
      return new ZdpPasskeyCeremonyError(ceremony, 'authenticator-error', error);
    case 'TypeError':
      return new ZdpPasskeyCeremonyError(ceremony, 'invalid-options', error);
    default:
      return new ZdpPasskeyCeremonyError(ceremony, 'unknown', error);
  }
}

function passkeyErrorMessage(reason: ZdpPasskeyErrorReason): string {
  switch (reason) {
    case 'unsupported':
      return 'Passkeys are not supported in this browser.';
    case 'conditional-ui-unsupported':
      return 'Conditional passkey UI is not supported in this browser.';
    case 'conditional-input-missing':
      return 'Conditional passkey UI requires an input whose autocomplete value ends with webauthn.';
    case 'cancelled':
      return 'The passkey ceremony was cancelled.';
    case 'timed-out':
      return 'The passkey ceremony timed out.';
    case 'not-allowed':
      return 'The passkey ceremony was not allowed or was dismissed.';
    case 'security-error':
      return 'The passkey ceremony was blocked by the browser security boundary.';
    case 'invalid-options':
      return 'The passkey ceremony options are invalid.';
    case 'authenticator-error':
      return 'The authenticator could not complete the passkey ceremony.';
    case 'unknown':
      return 'The passkey ceremony failed for an unknown reason.';
  }
}
