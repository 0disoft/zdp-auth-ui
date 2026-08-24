import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';
import {
  ZdpPasskeyCeremonyError,
  cancelPasskeyCeremony,
  detectPasskeySupport,
  startPasskeyAuthentication,
  zdpPasskeyAuthenticationMediationModes,
  zdpPasskeyCeremonyKinds,
  zdpPasskeyErrorReasons
} from '../src/lib/passkey';

const [loginIdFieldSource, publicEntrySource, packageSurfaceSource] = await Promise.all([
  readFile(new URL('../src/lib/components/LoginIdField.svelte', import.meta.url), 'utf8'),
  readFile(new URL('../src/lib/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('./build-package-surface.ts', import.meta.url), 'utf8')
]);
assert.ok(
  loginIdFieldSource.includes(
    "export let autocomplete: 'username' | 'username webauthn' = 'username';"
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
  "readonly autocomplete?: 'username' | 'username webauthn';",
  'ceremonyOptions?: ZdpPasskeyAuthenticationOptions',
  'export declare function cancelPasskeyCeremony(): void;'
]) {
  assert.ok(
    packageSurfaceSource.includes(requiredDeclaration),
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

class TestPublicKeyCredential {
  static async isConditionalMediationAvailable(): Promise<boolean> {
    return true;
  }

  static async isUserVerifyingPlatformAuthenticatorAvailable(): Promise<boolean> {
    return true;
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
  assert.equal(capturedRequest?.mediation, undefined);

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
  assert.equal(capturedRequest?.mediation, 'conditional');

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
} finally {
  cancelPasskeyCeremony();
  restoreTestGlobals();
}
