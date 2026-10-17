import { expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as contract from 'zdp-auth-ui/contract';
import * as passkey from 'zdp-auth-ui/passkey';

test('lean contracts expose the same validators as the browser compatibility entry', async () => {
  const root = await import(pathToFileURL(resolve('dist/index.js')).href);
  for (const name of ['validateProductLinkRequest', 'validPasskeyLabel',
    'isZdpPasskeyAuthenticatorProvider', 'isZdpPasskeyAuthenticatorStorage',
    'isZdpPasskeyRegistrationPreference', 'zdpPasskeyAuthenticatorProviders',
    'zdpPasskeyAuthenticatorStorages', 'zdpPasskeyRegistrationPreferenceDefault',
    'zdpPasskeyRegistrationPreferences'] as const) {
    expect(contract[name]).toBeDefined();
    expect(contract[name]).toBe(root[name]);
  }
  expect(contract.validPasskeyLabel('Desktop')).toBe(true);
  expect(contract.validPasskeyLabel('')).toBe(false);
  expect(contract.isZdpPasskeyRegistrationPreference('security_key')).toBe(true);
  expect(contract.validateProductLinkRequest(null as never, null as never))
    .toEqual({ disposition: 'invalid', actionable: false });
});

test('passkey subpath shares browser helper identity and fails closed during SSR', async () => {
  const root = await import(pathToFileURL(resolve('dist/index.js')).href);
  for (const name of ['startPasskeyAuthentication', 'startPasskeyRegistration', 'detectPasskeySupport',
    'cancelPasskeyCeremony', 'ZdpPasskeyCeremonyError', 'zdpPasskeyAuthenticationMediationModes',
    'zdpPasskeyCeremonyKinds', 'zdpPasskeyErrorReasons'] as const) {
    expect(passkey[name]).toBeDefined();
    expect(passkey[name]).toBe(root[name]);
  }
  expect(await passkey.detectPasskeySupport()).toEqual({
    supported: false, conditionalUi: false, platformAuthenticator: false
  });
  for (const operation of [() => passkey.startPasskeyAuthentication({ challenge: 'AA' }),
    () => passkey.startPasskeyRegistration({} as never)]) {
    await expect(operation()).rejects.toBeInstanceOf(passkey.ZdpPasskeyCeremonyError);
    await expect(operation()).rejects.toMatchObject({ reason: 'unsupported' });
  }
  expect(() => passkey.cancelPasskeyCeremony()).not.toThrow();
});
