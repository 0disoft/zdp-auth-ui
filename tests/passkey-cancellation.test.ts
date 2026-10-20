import { afterEach, beforeEach, expect, test } from 'bun:test';
import { cancelPasskeyCeremony, startPasskeyAuthentication } from '../src/lib/passkey';

const keys = ['navigator', 'PublicKeyCredential'] as const;
const originals = keys.map(key => Object.getOwnPropertyDescriptor(globalThis, key));
let requests: CredentialRequestOptions[];
let onFirstAbort: () => void;
const begin = (signal?: AbortSignal) => startPasskeyAuthentication({ challenge: 'AA' }, { signal })
  .catch(error => error);

beforeEach(() => {
  requests = [];
  onFirstAbort = () => {};
  Object.defineProperty(globalThis, 'PublicKeyCredential', { configurable: true, value: class {} });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
    credentials: { get: (request: CredentialRequestOptions) => {
      requests.push(request);
      if (requests.length === 1) request.signal!.addEventListener('abort', () => onFirstAbort(), { once: true });
      // Some browser extensions ignore abort; the helper must still settle.
      return new Promise(() => {});
    } }
  } });
});

afterEach(() => {
  onFirstAbort = () => {};
  cancelPasskeyCeremony();
  keys.forEach((key, index) => {
    const original = originals[index];
    if (original) Object.defineProperty(globalThis, key, original);
    else Reflect.deleteProperty(globalThis, key);
  });
});

test('a ceremony started by an abort listener remains cancellable', async () => {
  const first = begin();
  let replacement: ReturnType<typeof begin> | undefined;
  onFirstAbort = () => { replacement = begin(); };
  cancelPasskeyCeremony();
  expect(requests).toHaveLength(2);
  expect(requests[1]!.signal!.aborted).toBe(false);
  cancelPasskeyCeremony();
  expect(requests[1]!.signal!.aborted).toBe(true);
  expect((await first).reason).toBe('cancelled');
  expect((await replacement!).reason).toBe('cancelled');
});

test('the newest reentrant ceremony supersedes a replacement still starting', async () => {
  const first = begin();
  let newest: ReturnType<typeof begin> | undefined;
  onFirstAbort = () => { newest = begin(); };
  const superseded = begin();
  expect(requests).toHaveLength(2);
  expect((await superseded).reason).toBe('cancelled');
  cancelPasskeyCeremony();
  expect(requests[1]!.signal!.aborted).toBe(true);
  expect((await first).reason).toBe('cancelled');
  expect((await newest!).reason).toBe('cancelled');
});

test('owner cancellation during replacement prevents a native request', async () => {
  const first = begin();
  const owner = new AbortController();
  onFirstAbort = () => owner.abort();
  const cancelled = begin(owner.signal);
  expect(requests).toHaveLength(1);
  expect((await cancelled).reason).toBe('cancelled');
  expect((await first).reason).toBe('cancelled');
});
