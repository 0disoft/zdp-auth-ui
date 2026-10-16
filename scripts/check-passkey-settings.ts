import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  isZdpPasskeyAuthenticatorProvider,
  isZdpPasskeyAuthenticatorStorage,
  isZdpPasskeyRegistrationPreference,
  validPasskeyLabel,
  zdpPasskeyAuthenticatorProviders,
  zdpPasskeyAuthenticatorStorages,
  zdpPasskeyRegistrationPreferenceDefault,
  zdpPasskeyRegistrationPreferences
} from '../src/lib/passkey-settings-contract';
import { getPasskeyRegistrationDefaultLabel, getPasskeySettingsMessages } from '../src/lib/passkey-settings-messages';
import { zdpAuthTargetLocales } from '../src/lib/i18n';

for (const label of ['Desktop', '휴대폰', '😀'.repeat(80)]) assert.equal(validPasskeyLabel(label), true);
for (const label of ['', '  ', '😀'.repeat(81), 'bad\u0000name']) assert.equal(validPasskeyLabel(label), false);
const keys = Object.keys(getPasskeySettingsMessages('en')).sort();
for (const locale of zdpAuthTargetLocales) {
  const messages = getPasskeySettingsMessages(locale);
  assert.deepEqual(Object.keys(messages).sort(), keys);
  assert.equal(messages, getPasskeySettingsMessages(locale));
  assert.ok(Object.isFrozen(messages));
  assert.ok(Object.values(messages).every(value => typeof value === 'string' && value.length > 0));
}
assert.deepEqual(getPasskeySettingsMessages('unknown'), getPasskeySettingsMessages('en'));
for (const locale of ['__proto__', 'constructor', 'toString']) {
  assert.deepEqual(getPasskeySettingsMessages(locale), getPasskeySettingsMessages('en'));
}

assert.deepEqual(zdpPasskeyAuthenticatorProviders,
  ['windows_hello', 'google_password_manager', 'bitwarden', 'apple_passwords', 'unknown']);
assert.deepEqual(zdpPasskeyAuthenticatorStorages, ['synced', 'device_bound']);
assert.deepEqual(zdpPasskeyRegistrationPreferences, ['device', 'manager', 'security_key', 'phone']);
assert.equal(zdpPasskeyRegistrationPreferenceDefault, 'device');

for (const provider of zdpPasskeyAuthenticatorProviders) {
  assert.equal(isZdpPasskeyAuthenticatorProvider(provider), true);
}
for (const provider of ['', 'chrome', 'unknown_provider', 'bitwarden ', null, 42]) {
  assert.equal(isZdpPasskeyAuthenticatorProvider(provider), false);
}
for (const storage of zdpPasskeyAuthenticatorStorages) {
  assert.equal(isZdpPasskeyAuthenticatorStorage(storage), true);
}
for (const storage of ['', 'backed_up', 'local', null]) {
  assert.equal(isZdpPasskeyAuthenticatorStorage(storage), false);
}
for (const preference of zdpPasskeyRegistrationPreferences) {
  assert.equal(isZdpPasskeyRegistrationPreference(preference), true);
}
for (const preference of ['', 'device_passkey', 'usb', null]) {
  assert.equal(isZdpPasskeyRegistrationPreference(preference), false);
}

assert.equal(getPasskeyRegistrationDefaultLabel('ko', 'device'), '이 기기 패스키');
assert.equal(getPasskeyRegistrationDefaultLabel('ko', 'manager'), '비밀번호 관리자');
assert.equal(getPasskeyRegistrationDefaultLabel('ko', 'security_key'), '보안 키');
assert.equal(getPasskeyRegistrationDefaultLabel('ko', 'phone'), '휴대폰 패스키');
assert.deepEqual(getPasskeyRegistrationDefaultLabel('unknown', 'device'),
  getPasskeyRegistrationDefaultLabel('en', 'device'));

for (const locale of zdpAuthTargetLocales) {
  const labels: string[] = zdpPasskeyRegistrationPreferences.map(
    (preference) => getPasskeyRegistrationDefaultLabel(locale, preference));
  for (const label of labels) {
    assert.ok(validPasskeyLabel(label),
      `${locale} preference default names must satisfy the passkey label contract.`);
  }
  assert.equal(new Set(labels).size, zdpPasskeyRegistrationPreferences.length,
    `${locale} preference default names must stay distinct.`);
}

assert.equal(getPasskeySettingsMessages('en').storageSynced, 'Sync-capable');
assert.equal(getPasskeySettingsMessages('ko').storageSynced, '동기화 가능');
assert.equal(getPasskeySettingsMessages('ko').storageUnknown, '저장 위치 미확인');
assert.equal(getPasskeySettingsMessages('ko').providerUnknown, '패스키');

for (const locale of zdpAuthTargetLocales) {
  const messages = getPasskeySettingsMessages(locale);
  assert.ok(messages.preferenceHelp.length <= 260,
    `${locale} registration help must stay short.`);
  assert.ok(!/bypass|건너뛰/u.test(messages.preferenceHelp),
    `${locale} registration help must not promise that the choice bypasses an extension.`);
  assert.ok(!['Bitwarden', 'Windows Hello', 'Apple Passwords'].includes(messages.providerUnknown),
    `${locale} unknown provider label must stay brand-neutral.`);
  assert.notEqual(messages.storageSynced, messages.storageDeviceBound,
    `${locale} storage labels must stay distinguishable.`);
}

const componentSource = await readFile(
  new URL('../src/lib/components/PasskeySettings.svelte', import.meta.url), 'utf8');
for (const requiredText of [
  'Badge, Button, Field, HelpText, Input, Label, Select, Surface',
  'bind:value={preferenceValue}',
  '{copy.preferenceLabel}',
  '{copy[preferenceLabels[option]]}',
  '{copy.preferenceHelp}',
  'oninput={() => (nameEdited = true)}',
  'label: name.trim(), preference, currentPassword',
  'copy.providerUnknown',
  'copy.storageSynced',
  'copy.storageUnknown',
  'copy.notBackedUp',
  '{key.authenticator ? providerLabel(key.authenticator) : copy.providerUnknown}',
  '{key.authenticator ? storageLabel(key.authenticator) : copy.storageUnknown}'
]) {
  assert.ok(componentSource.includes(requiredText),
    `PasskeySettings must render the shared passkey management contract: ${requiredText}.`);
}
for (const forbiddenText of ["'Bitwarden'", '"Bitwarden"', 'Windows Hello', 'Google Password Manager', 'Apple Passwords']) {
  assert.ok(!componentSource.includes(forbiddenText),
    'PasskeySettings must not hardcode provider brand names; authenticator labels stay in the message catalog.');
}

console.log('Passkey settings labels, authenticator metadata, and 12-locale catalogs checked.');
