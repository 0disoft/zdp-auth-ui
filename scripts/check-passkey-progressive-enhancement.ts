import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';
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

const [loginIdFieldSource, publicEntrySource, packageSurfaceSource] = await Promise.all([
  readFile(new URL('../src/lib/components/LoginIdField.svelte', import.meta.url), 'utf8'),
  readFile(new URL('../src/lib/index.ts', import.meta.url), 'utf8'),
  Promise.all([
    readFile(new URL('../dist/svelte/passkey.d.ts', import.meta.url), 'utf8'),
    readFile(new URL('../dist/svelte/components/LoginIdField.svelte.d.ts', import.meta.url), 'utf8')
  ]).then(parts => parts.join('\n'))
]);
assert.ok(
  loginIdFieldSource.includes(
    "autocomplete?: 'username' | 'username webauthn';"
  ),
  'LoginIdField must keep an explicit conditional-UI autocomplete contract.'
);
assert.ok(
  loginIdFieldSource.includes('{autocomplete}'),
  'LoginIdField must forward its autocomplete contract to the design-system input.'
);

for (const requiredExport of [
  'cancelPasskeyCeremony',
  'detectPasskeySupport',
  'ZdpPasskeyCeremonyError',
  'type ZdpPasskeyAuthenticationOptions',
  'type ZdpPasskeySupport'
]) {
  assert.ok(
    publicEntrySource.includes(requiredExport),
    `The public entry must export ${requiredExport}.`
  );
}

for (const requiredDeclaration of [
  'export declare function detectPasskeySupport()',
  'export declare class ZdpPasskeyCeremonyError extends Error',
  'autocomplete?: "username" | "username webauthn";',
  'ceremonyOptions?: ZdpPasskeyAuthenticationOptions',
  'export declare function cancelPasskeyCeremony(): void;'
]) {
  assert.ok(
    packageSurfaceSource.replaceAll("'", '"').includes(requiredDeclaration),
    `The generated package declaration must include ${requiredDeclaration}.`
  );
}

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
    querySelectorAll: () => ({ length: hasAutofillInput ? 1 : 0 })
  });
  setTestGlobal('navigator', {
    credentials: {
      get: async (request: CredentialRequestOptions) => {
        capturedRequest = request;
        return credentialGet(request);
      },
      create: async (request: CredentialCreationOptions) => {
        capturedCreation = request;
        return waitForAbort(request);
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
  const firstOwner = new AbortController();
  const firstOwned = startPasskeyAuthentication(options, { signal: firstOwner.signal });
  const firstOwnedCheck = assert.rejects(firstOwned,
    (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'cancelled');
  const nextOwner = new AbortController();
  const nextOwned = startPasskeyAuthentication(options, { signal: nextOwner.signal });
  const nextOwnedCheck = assert.rejects(nextOwned,
    (error: unknown) => error instanceof ZdpPasskeyCeremonyError && error.reason === 'cancelled');
  const nextRequest = getCapturedRequest();
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

  await assert.rejects(
    () => startPasskeyAuthentication(options, { timeoutMs: 999 }),
    (error: unknown) => {
      assert.ok(error instanceof ZdpPasskeyCeremonyError);
      assert.equal(error.reason, 'invalid-options');
      return true;
    },
    'Timeouts outside the public bounds must fail before a ceremony starts.'
  );

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
