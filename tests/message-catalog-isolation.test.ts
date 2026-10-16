import { expect, test } from 'bun:test';
import { getAuthMessages } from '../src/lib/i18n';
import { zdpAuthTargetLocales } from '../src/lib/i18n';
import { getPasskeySettingsMessages } from '../src/lib/passkey-settings-messages';

function verifyCatalog(getMessages: () => ReturnType<typeof getAuthMessages>): void {
  const messages = getMessages();
  const original = messages.title.login;
  try {
    Reflect.set(messages.title, 'login', 'Changed by another consumer');
    expect(getMessages().title.login).toBe(original);
  } finally { Reflect.set(messages.title, 'login', original); }
}

test('shared synchronous auth messages cannot be poisoned by another consumer', () => {
  verifyCatalog(() => getAuthMessages('en'));
});

test('synchronous catalogs reuse deeply frozen objects for every locale', () => {
  function verifyFrozen(value: object): void {
    expect(Object.isFrozen(value)).toBe(true);
    for (const child of Object.values(value)) {
      if (typeof child === 'object' && child !== null) verifyFrozen(child);
    }
  }
  for (const locale of zdpAuthTargetLocales) {
    const auth = getAuthMessages(locale);
    const settings = getPasskeySettingsMessages(locale);
    expect(getAuthMessages(locale)).toBe(auth);
    expect(getPasskeySettingsMessages(locale)).toBe(settings);
    verifyFrozen(auth);
    verifyFrozen(settings);
    expect(Reflect.set(settings, 'title', 'Changed by another consumer')).toBe(false);
    expect(Reflect.set(auth.productLink.status, 'invalid', 'Changed by another consumer')).toBe(false);
  }
  for (const locale of ['unknown', '__proto__', 'constructor', 'toString']) {
    expect(getAuthMessages(locale)).toBe(getAuthMessages('en'));
    expect(getPasskeySettingsMessages(locale)).toBe(getPasskeySettingsMessages('en'));
  }
});

test('shared lazy locale messages cannot be poisoned by another consumer', async () => {
  const { loadAuthMessages } = await import('../dist/i18n/loader.js');
  const messages = await loadAuthMessages('en');
  verifyCatalog(() => messages);
  expect((await loadAuthMessages('en')).title.login).toBe(messages.title.login);
});

test('locale modules and loader include matching immutable passkey settings copy', async () => {
  const { loadAuthLocale, loadPasskeySettingsMessages } = await import('../dist/i18n/loader.js');
  for (const locale of zdpAuthTargetLocales) {
    const catalog = await loadAuthLocale(locale);
    expect(catalog.locale).toBe(locale);
    expect(catalog.messages).toEqual(getAuthMessages(locale));
    expect(catalog.passkeySettingsMessages).toEqual(getPasskeySettingsMessages(locale));
    expect(await loadPasskeySettingsMessages(locale)).toBe(catalog.passkeySettingsMessages);
    expect(Object.isFrozen(catalog.passkeySettingsMessages)).toBe(true);
  }
  for (const locale of ['unknown', '__proto__', 'constructor', 'toString']) {
    expect((await loadAuthLocale(locale)).locale).toBe('en');
  }
});
