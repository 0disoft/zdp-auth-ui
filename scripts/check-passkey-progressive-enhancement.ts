import assert from 'node:assert/strict';
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';
import { WebAuthnAbortService, WebAuthnError, type WebAuthnErrorCode } from '@simplewebauthn/browser';
import {
  ZdpPasskeyCeremonyError,
  cancelPasskeyCeremony,
  detectPasskeySupport,
  startPasskeyAuthentication,
  startPasskeyRegistration,
  zdpPasskeyAuthenticationMediationModes,
  zdpPasskeyCeremonyKinds,
  zdpPasskeyErrorReasons
} from '../src/lib/passkey';
import type { ZdpPasskeyErrorReason } from '../src/lib/passkey';

const support = await detectPasskeySupport();
assert.deepEqual(
  support,
  {
    supported: false,
    conditionalUi: false,
    platformAuthenticator: false
  },
  'The non-browser validation runtime must fail closed without probing credentials.'
);

const options: PublicKeyCredentialRequestOptionsJSON = {
  challenge: 'AA'
};

await assert.rejects(
  () => startPasskeyAuthentication(options),
  (error: unknown) => {
    assert.ok(error instanceof ZdpPasskeyCeremonyError);
    assert.equal(error.ceremony, 'authentication');
    assert.equal(error.reason, 'unsupported');
    return true;
  },
  'Unsupported runtimes must receive a typed passkey error.'
);

assert.deepEqual(zdpPasskeyCeremonyKinds, ['authentication', 'registration']);
assert.deepEqual(zdpPasskeyAuthenticationMediationModes, ['modal', 'conditional']);
assert.ok(zdpPasskeyErrorReasons.includes('cancelled'));
assert.ok(zdpPasskeyErrorReasons.includes('timed-out'));
assert.ok(zdpPasskeyErrorReasons.includes('unsupported'));

cancelPasskeyCeremony();

const originalGlobals = new Map<string, PropertyDescriptor | undefined>();
for (const key of ['PublicKeyCredential', 'document', 'location', 'navigator']) {
  originalGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
}

function setTestGlobal(key: string, value: unknown): void {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value
  });
}

function restoreTestGlobals(): void {
  for (const [key, descriptor] of originalGlobals) {
    if (descriptor) {
      Object.defineProperty(globalThis, key, descriptor);
    } else {
      Reflect.deleteProperty(globalThis, key);
    }
  }
}

type CredentialGet = (request: CredentialRequestOptions) => Promise<Credential | null>;

let hasAutofillInput = false;
let credentialGet: CredentialGet = async () => createAuthenticationCredential();
let capturedRequest: CredentialRequestOptions | null = null;
let capturedCreation: CredentialCreationOptions | null = null;
let credentialCreate = (request: CredentialCreationOptions): Promise<Credential | null> => waitForAbort(request);
const getCapturedCreation = (): CredentialCreationOptions | null => capturedCreation;
const getCapturedRequest = (): CredentialRequestOptions | null => capturedRequest;
let conditionalProbe: () => Promise<boolean> = async () => true;
let platformProbe: () => Promise<boolean> = async () => true;

class TestPublicKeyCredential {
  static async isConditionalMediationAvailable(): Promise<boolean> {
    return conditionalProbe();
  }

  static async isUserVerifyingPlatformAuthenticatorAvailable(): Promise<boolean> {
    return platformProbe();
  }
}

function createAuthenticationCredential(): Credential {
  const byte = new Uint8Array([1]).buffer;
  return {
    id: 'credential-id',
    rawId: byte,
    response: {
      authenticatorData: byte,
      clientDataJSON: byte,
      signature: byte,
      userHandle: null
    },
    type: 'public-key',
    authenticatorAttachment: 'platform',
    getClientExtensionResults: () => ({})
  } as unknown as Credential;
}

function waitForAbort(request: CredentialRequestOptions): Promise<Credential | null> {
  return new Promise((_, reject) => {
    const signal = request.signal;
    assert.ok(signal, 'Passkey ceremonies must provide an abort signal.');
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
}

try {
  setTestGlobal('PublicKeyCredential', TestPublicKeyCredential);
  setTestGlobal('location', { hostname: 'localhost' });
  setTestGlobal('document', {
    querySelector: () => hasAutofillInput ? {} : null,
    querySelectorAll: () => { throw new Error('Autofill must never scan the global document outside its root.'); }
  });
  setTestGlobal('navigator', {
    credentials: {
      get: async (request: CredentialRequestOptions) => {
        capturedRequest = request;
        return credentialGet(request);
      },
      create: async (request: CredentialCreationOptions) => {
        capturedCreation = request;
        return credentialCreate(request);
      }
    }
  });

  assert.deepEqual(
    await detectPasskeySupport(),
    { supported: true, conditionalUi: true, platformAuthenticator: true },
    'Browser capability probes must report the available WebAuthn features.'
  );

  const modalResponse = await startPasskeyAuthentication(options);
  assert.equal(modalResponse.id, 'credential-id');
  assert.equal(getCapturedRequest()?.mediation, undefined);

  await assert.rejects(
    () => startPasskeyAuthentication(options, { mediation: 'conditional' }),
    (error: unknown) => {
      assert.ok(error instanceof ZdpPasskeyCeremonyError);
      assert.equal(error.reason, 'conditional-input-missing');
      return true;
    },
    'Conditional UI must fail closed when its autocomplete input is absent.'
  );

  hasAutofillInput = true;
  const conditionalResponse = await startPasskeyAuthentication(options, {
    mediation: 'conditional'
  });
  assert.equal(conditionalResponse.id, 'credential-id');
  assert.equal(getCapturedRequest()?.mediation, 'conditional');

  // A different form's autofill input cannot satisfy this form's precondition.
  const emptyContainer = { querySelector: () => null } as unknown as ParentNode;
  await assert.rejects(
    startPasskeyAuthentication(options, { mediation: 'conditional', container: emptyContainer }),
    (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'conditional-input-missing'
  );
  hasAutofillInput = false;
  const scopedContainer = { querySelector: () => ({}) } as unknown as ParentNode;
  assert.equal((await startPasskeyAuthentication(options, {
    mediation: 'conditional', container: scopedContainer
  })).id, 'credential-id', 'Scoped inputs must work without a matching input in document (including shadow roots).');
  hasAutofillInput = true;

  credentialGet = waitForAbort;
  const sdkOwnedSignal = WebAuthnAbortService.createNewAbortSignal();
  const firstOwner = new AbortController();
  const firstOwned = startPasskeyAuthentication(options, { signal: firstOwner.signal });
  assert.equal(sdkOwnedSignal.aborted, false, 'Starting our helper must not cancel a separate SDK consumer.');
  const firstOwnedCheck = assert.rejects(firstOwned,
    (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'cancelled');
  const nextOwner = new AbortController();
  const nextOwned = startPasskeyAuthentication(options, { signal: nextOwner.signal });
  const nextOwnedCheck = assert.rejects(nextOwned,
    (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'cancelled');
  const nextRequest = getCapturedRequest();
  WebAuthnAbortService.cancelCeremony();
  assert.equal(nextRequest?.signal?.aborted, false, 'A separate SDK consumer must not cancel our browser request.');
  firstOwner.abort();
  assert.equal(nextRequest?.signal?.aborted, false, 'An old owner must not cancel a replacement prompt.');
  const alreadyCancelled = new AbortController();
  alreadyCancelled.abort();
  await assert.rejects(startPasskeyAuthentication(options, { signal: alreadyCancelled.signal }),
    (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'cancelled');
  assert.equal(getCapturedRequest(), nextRequest, 'An already-cancelled caller must not start a new prompt.');
  assert.equal(nextRequest?.signal?.aborted, false, 'An already-cancelled caller must leave the active owner alone.');
  nextOwner.abort('component-unmounted');
  await Promise.all([firstOwnedCheck, nextOwnedCheck]);
  assert.equal(nextRequest?.signal?.aborted, true, 'The current owner must cancel its own browser prompt.');

  const registrationOwner = new AbortController();
  const registrationOptions: PublicKeyCredentialCreationOptionsJSON = {
    challenge: 'AA', rp: { name: 'Test', id: 'localhost' },
    user: { id: 'AA', name: 'test', displayName: 'Test' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }], extensions: { credProps: true }
  };
  const registration = startPasskeyRegistration(registrationOptions, { signal: registrationOwner.signal });
  const registrationCheck = assert.rejects(registration,
    (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.ceremony === 'registration' && error.reason === 'cancelled');
  registrationOptions.rp.name = 'Changed';
  registrationOptions.pubKeyCredParams[0]!.alg = -257;
  registrationOptions.extensions!.credProps = false;
  const capturedPublicKeyCreation = getCapturedCreation()?.publicKey;
  assert.equal(capturedPublicKeyCreation?.rp.name, 'Test');
  assert.equal(capturedPublicKeyCreation?.pubKeyCredParams[0]?.alg, -7);
  assert.equal(capturedPublicKeyCreation?.extensions?.credProps, true,
    'Registration must snapshot nested server-issued options before browser transport.');
  registrationOwner.abort();
  await registrationCheck;

  const byte = new Uint8Array([1]).buffer;
  credentialCreate = async () => ({
    id: 'registration-id', rawId: byte, type: 'public-key',
    response: {
      attestationObject: byte, clientDataJSON: byte,
      getTransports: () => ['internal'], getPublicKeyAlgorithm: () => -7,
      getPublicKey: () => byte, getAuthenticatorData: () => byte
    },
    getClientExtensionResults: () => ({ credProps: { rk: true } }),
    authenticatorAttachment: 'platform'
  } as unknown as Credential);
  const registrationResponse = await startPasskeyRegistration(registrationOptions);
  assert.deepEqual(registrationResponse, {
    id: 'registration-id', rawId: 'AQ', type: 'public-key',
    response: { attestationObject: 'AQ', clientDataJSON: 'AQ', transports: ['internal'],
      publicKeyAlgorithm: -7, publicKey: 'AQ', authenticatorData: 'AQ' },
    clientExtensionResults: { credProps: { rk: true } }, authenticatorAttachment: 'platform'
  }, 'Registration must preserve the server-facing SimpleWebAuthn JSON wire format.');
  credentialCreate = async () => ({
    id: 'legacy-registration', rawId: byte, type: 'public-key',
    response: { attestationObject: byte, clientDataJSON: byte,
      getPublicKey: () => { throw new Error('Extension does not support L3 metadata'); } },
    getClientExtensionResults: () => ({})
  } as unknown as Credential);
  const legacyResponse = await startPasskeyRegistration(registrationOptions);
  assert.equal(legacyResponse.response.attestationObject, 'AQ');
  assert.equal(legacyResponse.response.publicKey, undefined);
  assert.equal(legacyResponse.response.transports, undefined);

  for (const result of [null, { id: 'unexpected-credential', type: 'password' } as Credential]) {
    credentialGet = credentialCreate = async () => result;
    const expectMissingPublicKey = (error: unknown) => {
      assert.ok(error instanceof ZdpPasskeyCeremonyError);
      assert.equal(error.reason, 'unknown',
        'Missing or unexpected browser credentials do not establish invalid request options.');
      assert.ok(error.cause instanceof Error);
      return true;
    };
    await assert.rejects(startPasskeyAuthentication(options), expectMissingPublicKey);
    await assert.rejects(startPasskeyAuthentication(options, { mediation: 'conditional' }), expectMissingPublicKey);
    await assert.rejects(startPasskeyRegistration(registrationOptions), expectMissingPublicKey);
  }

  // Exercise the public helpers through native API failures, including their
  // diagnostic cause chain. No SDK start method participates in these tests.
  function expectNativeError(
    reason: ZdpPasskeyErrorReason, native: Error, code?: WebAuthnErrorCode
  ) {
    return (error: unknown) => {
      assert.ok(error instanceof ZdpPasskeyCeremonyError);
      assert.equal(error.reason, reason);
      if (code) {
        assert.ok(error.cause instanceof WebAuthnError);
        assert.equal(error.cause.code, code);
        assert.equal(error.cause.cause, native);
      } else {
        assert.equal(error.cause, native, 'Ambiguous errors must retain the original browser exception.');
      }
      return true;
    };
  }
  for (const [name, reason, code] of [
    ['AbortError', 'cancelled', 'ERROR_CEREMONY_ABORTED'],
    ['NotAllowedError', 'not-allowed', undefined],
    ['SecurityError', 'security-error', undefined],
    ['ConstraintError', 'authenticator-error', undefined],
    ['UnknownError', 'authenticator-error', 'ERROR_AUTHENTICATOR_GENERAL_ERROR'],
    ['TypeError', 'invalid-options', undefined],
    ['UnexpectedError', 'unknown', undefined]
  ] as const) {
    const native = new DOMException('브라우저의 원본 메시지', name);
    credentialGet = credentialCreate = async () => { throw native; };
    await assert.rejects(startPasskeyAuthentication(options), expectNativeError(reason, native, code));
    await assert.rejects(startPasskeyRegistration(registrationOptions), expectNativeError(reason, native, code));
  }
  const duplicate = new DOMException('Already enrolled', 'InvalidStateError');
  credentialGet = credentialCreate = async () => { throw duplicate; };
  await assert.rejects(startPasskeyRegistration(registrationOptions),
    expectNativeError('authenticator-error', duplicate, 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED'));
  await assert.rejects(startPasskeyAuthentication(options), expectNativeError('authenticator-error', duplicate));

  const unsupportedAlgorithm = new DOMException('Unsupported', 'NotSupportedError');
  credentialGet = credentialCreate = async () => { throw unsupportedAlgorithm; };
  await assert.rejects(startPasskeyRegistration(registrationOptions), expectNativeError('authenticator-error',
    unsupportedAlgorithm, 'ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG'));
  await assert.rejects(startPasskeyRegistration({ ...registrationOptions, pubKeyCredParams: [] }),
    expectNativeError('invalid-options', unsupportedAlgorithm, 'ERROR_MALFORMED_PUBKEYCREDPARAMS'));
  await assert.rejects(startPasskeyAuthentication(options), expectNativeError('unsupported', unsupportedAlgorithm));

  const invalidUser = new TypeError('Invalid user ID');
  credentialCreate = async () => { throw invalidUser; };
  for (const id of ['', Buffer.alloc(65, 1).toString('base64url')]) {
    await assert.rejects(startPasskeyRegistration({ ...registrationOptions,
      user: { ...registrationOptions.user, id } }),
    expectNativeError('invalid-options', invalidUser, 'ERROR_INVALID_USER_ID_LENGTH'));
  }
  const security = new DOMException('Blocked', 'SecurityError');
  credentialGet = credentialCreate = async () => { throw security; };
  setTestGlobal('location', { hostname: 'login.example.test' });
  for (const rpId of ['example.test', 'related.example.org']) {
    await assert.rejects(startPasskeyAuthentication({ ...options, rpId }),
      expectNativeError('security-error', security));
    await assert.rejects(startPasskeyRegistration({ ...registrationOptions,
      rp: { ...registrationOptions.rp, id: rpId } }), expectNativeError('security-error', security));
  }
  setTestGlobal('location', { hostname: 'localhost' });
  let invalidEncodingNativeCalls = 0;
  credentialGet = credentialCreate = async () => {
    invalidEncodingNativeCalls++;
    throw new Error('Malformed encoded options must fail before browser transport.');
  };
  for (const invalidEncoding of ['!', 'A']) {
    const invalidAuthenticationOptions = [
      { ...options, challenge: invalidEncoding },
      { ...options, allowCredentials: [{ id: invalidEncoding, type: 'public-key' as const }] }
    ];
    const invalidRegistrationOptions = [
      { ...registrationOptions, challenge: invalidEncoding },
      { ...registrationOptions, user: { ...registrationOptions.user, id: invalidEncoding } },
      { ...registrationOptions, excludeCredentials: [{ id: invalidEncoding, type: 'public-key' as const }] }
    ];
    for (const [ceremony, requests] of [
      ['authentication', invalidAuthenticationOptions], ['registration', invalidRegistrationOptions]
    ] as const) {
      for (const request of requests) {
        await assert.rejects(ceremony === 'authentication'
          ? startPasskeyAuthentication(request as PublicKeyCredentialRequestOptionsJSON)
          : startPasskeyRegistration(request as PublicKeyCredentialCreationOptionsJSON), (error: unknown) => {
          assert.ok(error instanceof ZdpPasskeyCeremonyError);
          assert.equal(error.ceremony, ceremony);
          assert.equal(error.reason, 'invalid-options');
          assert.ok(error.cause instanceof TypeError);
          assert.ok(error.cause.cause instanceof Error);
          assert.equal(error.cause.cause.name, 'InvalidCharacterError', 'Keep the original decoder failure as the cause.');
          return true;
        });
      }
    }
  }
  assert.equal(invalidEncodingNativeCalls, 0, 'Malformed option encoding must never reach credentials.get/create.');
  credentialGet = async () => createAuthenticationCredential();

  await assert.rejects(
    () => startPasskeyAuthentication(options, { timeoutMs: 999 }),
    (error: unknown) => {
      assert.ok(error instanceof ZdpPasskeyCeremonyError);
      assert.equal(error.reason, 'invalid-options');
      return true;
    },
    'Timeouts outside the public bounds must fail before a ceremony starts.'
  );

  const mediationLength = zdpPasskeyAuthenticationMediationModes.length;
  const changedMediation = Reflect.set(zdpPasskeyAuthenticationMediationModes, mediationLength, 'invalid');
  const beforeInvalidMediation = getCapturedRequest();
  try {
    await assert.rejects(startPasskeyAuthentication(options, { mediation: 'invalid' as 'modal' }),
      (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'invalid-options',
      'Consumer mutation must not extend the browser mediation policy.');
    assert.equal(getCapturedRequest(), beforeInvalidMediation, 'Invalid mediation must not reach credentials.get.');
    assert.equal(changedMediation, false);
  } finally {
    if (changedMediation) Reflect.set(zdpPasskeyAuthenticationMediationModes, 'length', mediationLength);
  }
  credentialGet = waitForAbort;
  await assert.rejects(
    () => startPasskeyAuthentication(options, { mediation: 'invalid' as 'modal' }),
    (error: unknown) => {
      assert.ok(error instanceof ZdpPasskeyCeremonyError);
      assert.equal(error.reason, 'invalid-options');
      return true;
    },
    'Invalid mediation must fail before cancelling or starting a browser ceremony.'
  );
  const cancelledCeremony = startPasskeyAuthentication(options);
  await Promise.resolve();
  cancelPasskeyCeremony();
  await assert.rejects(
    cancelledCeremony,
    (error: unknown) => {
      assert.ok(error instanceof ZdpPasskeyCeremonyError);
      assert.equal(error.reason, 'cancelled');
      return true;
    },
    'Explicit cancellation must return the stable cancelled reason.'
  );

  await assert.rejects(
    () => startPasskeyAuthentication(options, { timeoutMs: 1_000 }),
    (error: unknown) => {
      assert.ok(error instanceof ZdpPasskeyCeremonyError);
      assert.equal(error.reason, 'timed-out');
      return true;
    },
    'Caller-bounded timeout must cancel the browser ceremony and retain timeout classification.'
  );
  // Cancelling or superseding a pending capability probe must prevent a late prompt.
  let finishProbe!: (value: boolean) => void;
  conditionalProbe = () => new Promise(resolve => { finishProbe = resolve; });
  capturedRequest = null;
  credentialGet = async () => createAuthenticationCredential();
  const preparing = startPasskeyAuthentication(options, { mediation: 'conditional' });
  cancelPasskeyCeremony();
  await assert.rejects(preparing, (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'cancelled');
  finishProbe(true);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(getCapturedRequest(), null, 'A cancelled preparation must never call credentials.get.');

  const preparingOwner = new AbortController();
  const ownedPreparing = startPasskeyAuthentication(options, { mediation: 'conditional', signal: preparingOwner.signal });
  preparingOwner.abort();
  await assert.rejects(ownedPreparing,
    (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'cancelled');
  finishProbe(true);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(getCapturedRequest(), null, 'Unmounting during capability detection must prevent a late prompt.');

  const superseded = startPasskeyAuthentication(options, { mediation: 'conditional' });
  const supersededCheck = assert.rejects(superseded, (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'cancelled');
  const replacement = await startPasskeyAuthentication(options);
  const replacementRequest = getCapturedRequest();
  assert.equal(replacement.id, 'credential-id');
  finishProbe(true);
  await supersededCheck;
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(getCapturedRequest(), replacementRequest, 'An older probe must not supersede a newer ceremony.');

  hasAutofillInput = false;
  capturedRequest = null;
  const preparationOptions = { mediation: 'conditional' as const, verifyBrowserAutofillInput: true };
  const capturedPreparation = startPasskeyAuthentication(options, preparationOptions);
  preparationOptions.verifyBrowserAutofillInput = false;
  const capturedPreparationCheck = assert.rejects(capturedPreparation,
    (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'conditional-input-missing',
    'Changing caller options during a capability probe must not disable the requested input check.');
  const finishCapturedProbe = finishProbe;
  conditionalProbe = async () => true;
  finishCapturedProbe(true);
  await capturedPreparationCheck;
  assert.equal(getCapturedRequest(), null);
  hasAutofillInput = true;

  conditionalProbe = () => new Promise(resolve => { finishProbe = resolve; });
  const mutableRequestOptions: PublicKeyCredentialRequestOptionsJSON = {
    challenge: 'AA', rpId: 'localhost', extensions: { appid: 'https://original.example.test' }
  };
  const preparingSnapshot = startPasskeyAuthentication(mutableRequestOptions, { mediation: 'conditional' });
  mutableRequestOptions.challenge = 'AQ';
  mutableRequestOptions.rpId = 'changed.example.test';
  mutableRequestOptions.extensions!.appid = 'https://changed.example.test';
  const finishSnapshotProbe = finishProbe;
  conditionalProbe = async () => true;
  finishSnapshotProbe(true);
  await preparingSnapshot;
  const capturedPublicKey = getCapturedRequest()?.publicKey;
  assert.deepEqual(new Uint8Array(capturedPublicKey!.challenge as ArrayBuffer), new Uint8Array([0]));
  assert.equal(capturedPublicKey?.rpId, 'localhost');
  assert.equal(capturedPublicKey?.extensions?.appid, 'https://original.example.test',
    'Browser preparation must preserve the original challenge and nested extensions.');

  conditionalProbe = platformProbe = () => new Promise(() => {});
  assert.deepEqual(await detectPasskeySupport(), { supported: true, conditionalUi: false, platformAuthenticator: false });
  await assert.rejects(
    startPasskeyAuthentication(options, { mediation: 'conditional', timeoutMs: 1_000 }),
    (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'timed-out',
    'The caller deadline must also cover conditional capability preparation.'
  );
  credentialGet = () => new Promise(() => {});
  await assert.rejects(
    startPasskeyAuthentication(options, { timeoutMs: 1_000 }),
    (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'timed-out',
    'A browser transport ignoring abort must still settle the public helper.'
  );
} finally {
  cancelPasskeyCeremony();
  restoreTestGlobals();
}
