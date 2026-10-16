import type { ZdpPasskeyRegistrationPreference } from './passkey-settings-contract.ts';
import type { ZdpAuthLocale, ZdpPasskeySettingsMessages } from './i18n/schema.ts';
import { freezeMessages } from './i18n/freeze-messages.ts';
import ko from './i18n/passkey-settings/ko.ts';
import en from './i18n/passkey-settings/en.ts';
import zh from './i18n/passkey-settings/zh.ts';
import es from './i18n/passkey-settings/es.ts';
import fr from './i18n/passkey-settings/fr.ts';
import hi from './i18n/passkey-settings/hi.ts';
import ja from './i18n/passkey-settings/ja.ts';
import vi from './i18n/passkey-settings/vi.ts';
import ru from './i18n/passkey-settings/ru.ts';
import id from './i18n/passkey-settings/id.ts';
import ms from './i18n/passkey-settings/ms.ts';
import th from './i18n/passkey-settings/th.ts';

export type { ZdpPasskeySettingsMessages } from './i18n/schema.ts';

const passkeySettingsMessages: Readonly<Record<ZdpAuthLocale, ZdpPasskeySettingsMessages>> = freezeMessages({
  ko, en, zh, es, fr, hi, ja, vi, ru, id, ms, th
});

export function getPasskeySettingsMessages(locale: string): ZdpPasskeySettingsMessages {
  return Object.hasOwn(passkeySettingsMessages, locale)
    ? passkeySettingsMessages[locale as ZdpAuthLocale] : passkeySettingsMessages.en;
}

const registrationDefaultNameKeys = {
  device: 'defaultNameDevice',
  manager: 'defaultNameManager',
  security_key: 'defaultNameSecurityKey',
  phone: 'defaultNamePhone'
} as const satisfies Record<ZdpPasskeyRegistrationPreference, keyof ZdpPasskeySettingsMessages>;

export function getPasskeyRegistrationDefaultLabel(
  locale: string,
  preference: ZdpPasskeyRegistrationPreference
): string {
  return getPasskeySettingsMessages(locale)[registrationDefaultNameKeys[preference]];
}
