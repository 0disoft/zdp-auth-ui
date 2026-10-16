import { expect, test } from 'bun:test';
import { createZdpAuthSurfaceModel as createCompatibleModel } from '../src/lib/auth-surface-model';
import { createZdpAuthSurfaceModel as createInjectedModel } from '../src/lib/auth-surface-model-core';
import enMessages from '../src/lib/i18n/auth/en';

for (const [entry, createModel] of [['compatibility', createCompatibleModel], ['injected', createInjectedModel]] as const) {
  test(`${entry} model uses the supplied catalog for provider labels regardless of locale`, () => {
    const messages = { ...enMessages,
      providers: { ...enMessages.providers, passkey: 'Consumer passkey', google: 'Consumer Google' } };
    const result = createModel({ locale: 'unsupported', messages, mode: 'login', availability: 'available',
      providerFlags: { google: true, passkey: true, github: false },
      links: { recoveryHref: ' /recover ', privacyHref: ' ' } });
    expect(result.messages).toBe(messages);
    expect(result.shell.providers).toEqual([
      { id: 'passkey', kind: 'passkey', label: 'Consumer passkey' },
      { id: 'google', kind: 'oauth', label: 'Consumer Google' }
    ]);
    expect(result.shell.recoveryHref).toBe('/recover');
    expect(result.shell.privacyHref).toBeNull();
    for (const value of [result, result.shell, result.shell.providers, ...result.shell.providers]) {
      expect(Object.isFrozen(value)).toBe(true);
    }
    expect(Object.isFrozen(messages)).toBe(false);
  });
}

test('compatibility model retains locale selection and English fallback when messages are omitted', () => {
  const config = { mode: 'login', availability: 'available' } as const;
  expect(createCompatibleModel({ ...config, locale: 'ko' }).messages.title.login).toBe('로그인');
  expect(createCompatibleModel({ ...config, locale: 'unknown' }).messages.title.login).toBe('Sign in');
});

test('injected recovery model keeps the supplied messages while suppressing sign-in choices', () => {
  const result = createInjectedModel({ locale: 'en', messages: enMessages, mode: 'recovery',
    availability: 'preparing', providerFlags: { passkey: true }, links: { recoveryHref: '/recover' } });
  expect(result.messages).toBe(enMessages);
  expect(result.shell.providers).toEqual([]);
  expect(result.shell.recoveryHref).toBeNull();
});
