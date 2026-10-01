import assert from 'node:assert/strict';
import { validPasskeyLabel } from '../src/lib/passkey-settings-contract';
import { getPasskeySettingsMessages } from '../src/lib/passkey-settings-messages';
import { zdpAuthTargetLocales } from '../src/lib/i18n';

for (const label of ['Desktop', '휴대폰', '😀'.repeat(80)]) assert.equal(validPasskeyLabel(label), true);
for (const label of ['', '  ', '😀'.repeat(81), 'bad\u0000name']) assert.equal(validPasskeyLabel(label), false);
const keys = Object.keys(getPasskeySettingsMessages('en'));
for (const locale of zdpAuthTargetLocales) {
  const messages = getPasskeySettingsMessages(locale);
  assert.deepEqual(Object.keys(messages), keys);
  assert.ok(Object.values(messages).every(value => typeof value === 'string' && value.length > 0));
}
assert.deepEqual(getPasskeySettingsMessages('unknown'), getPasskeySettingsMessages('en'));
for (const locale of ['__proto__', 'constructor', 'toString']) {
  assert.deepEqual(getPasskeySettingsMessages(locale), getPasskeySettingsMessages('en'));
}
console.log('Passkey settings labels and 12-locale catalogs checked.');
