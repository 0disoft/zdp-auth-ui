import { expect, test } from 'bun:test';
import { getAuthMessages } from '../src/lib/i18n';

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

test('shared lazy locale messages cannot be poisoned by another consumer', async () => {
  const { loadAuthMessages } = await import('../dist/i18n/loader.js');
  const messages = await loadAuthMessages('en');
  verifyCatalog(() => messages);
  expect((await loadAuthMessages('en')).title.login).toBe(messages.title.login);
});
