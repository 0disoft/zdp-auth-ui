import {
  zdpAuthActiveLocales,
  zdpAuthMessages,
  zdpAuthTargetLocales,
  getAuthMessages,
  type ZdpAuthActiveLocale
} from 'zdp-auth-ui/i18n';
import { PasskeySettings, getPasskeySettingsMessages, validPasskeyLabel, type AuthShellProps,
  type PasskeySettingsProps, type ZdpPasskeySettingsState } from 'zdp-auth-ui';

const japaneseTitle: string = zdpAuthMessages.ja.title.login;
const signupTitles: string[] = zdpAuthTargetLocales.map((locale) => zdpAuthMessages[locale].title.signup);
const confirmationLabels: string[] = zdpAuthTargetLocales.map((locale) => zdpAuthMessages[locale].fields.passwordConfirmation);
const mismatchMessages: string[] = zdpAuthTargetLocales.map((locale) => getAuthMessages(locale).feedback.passwordMismatch);
const activeLocale: ZdpAuthActiveLocale = zdpAuthActiveLocales[0];
const busyShellProps: AuthShellProps = { busy: true };
const signupShellProps: AuthShellProps = { mode: 'signup', availability: 'preparing', signupTermsInSlot: true };

void [japaneseTitle, signupTitles, confirmationLabels, mismatchMessages, activeLocale, busyShellProps, signupShellProps];
const passkeyState: ZdpPasskeySettingsState = { status: 'ready', passkeys: [],
  capabilities: { register: true, rename: false, revoke: true }, reauthentication: 'password' };
const passkeyProps: PasskeySettingsProps = { state: passkeyState, busy: false,
  onaction: detail => { if (detail.action === 'register') void detail.currentPassword; } };
void [PasskeySettings, passkeyProps, getPasskeySettingsMessages('ko').removeHelp, validPasskeyLabel('Desktop')];
