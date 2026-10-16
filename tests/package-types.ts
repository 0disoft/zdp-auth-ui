import {
  zdpAuthActiveLocales,
  zdpAuthMessages,
  zdpAuthTargetLocales,
  getAuthMessages,
  type ZdpAuthActiveLocale
} from 'zdp-auth-ui/i18n';
import { PasskeySettings, getPasskeySettingsMessages, validPasskeyLabel, type AuthShellProps,
  type PasskeySettingsProps, type ZdpPasskeySettingsState } from 'zdp-auth-ui';
import koMessages, { passkeySettingsMessages } from 'zdp-auth-ui/i18n/ko';
import { loadAuthLocale, loadPasskeySettingsMessages } from 'zdp-auth-ui/i18n/loader';
import type { AuthShellProps as LeanShellProps,
  PasskeySettingsProps as LeanPasskeyProps } from 'zdp-auth-ui/components';

const injectedShellProps: AuthShellProps = { locale: 'ko', messages: koMessages };
const injectedPasskeyProps: PasskeySettingsProps = {
  locale: 'ko', messages: passkeySettingsMessages, authMessages: koMessages
};
void [injectedShellProps, injectedPasskeyProps, loadAuthLocale, loadPasskeySettingsMessages];
const leanShell: LeanShellProps = { messages: koMessages, locale: 'ko' };
const leanPasskeys: LeanPasskeyProps = {
  messages: passkeySettingsMessages, authMessages: koMessages, locale: 'ko'
};
// @ts-expect-error Lean components require an explicitly loaded catalog.
const missingShellCatalog: LeanShellProps = {};
// @ts-expect-error Reauthentication also needs the auth catalog for password controls.
const missingAuthCatalog: LeanPasskeyProps = { messages: passkeySettingsMessages };
void [leanShell, leanPasskeys, missingShellCatalog, missingAuthCatalog];

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
const passkeyStateWithAuthenticator: ZdpPasskeySettingsState = { status: 'ready',
  passkeys: [{ passkey_id: 'key-1', label: 'Desktop', created_at: '2026-01-01T00:00:00.000Z',
    last_used_at: null,
    authenticator: { provider: 'bitwarden', storage: 'synced', backed_up: true } }],
  capabilities: { register: true, rename: true, revoke: true }, reauthentication: 'passkey' };
const passkeyProps: PasskeySettingsProps = { state: passkeyState, busy: false,
  feedbackSequence: 1,
  onaction: detail => {
    const sequence: number | undefined = detail.sequence;
    void sequence;
    if (detail.action === 'register') void [detail.currentPassword, detail.preference];
  } };
void [PasskeySettings, passkeyProps, passkeyStateWithAuthenticator,
  getPasskeySettingsMessages('ko').removeHelp, validPasskeyLabel('Desktop')];
