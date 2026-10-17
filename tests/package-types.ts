import {
  zdpAuthActiveLocales,
  zdpAuthMessages,
  zdpAuthTargetLocales,
  getAuthMessages,
  type ZdpAuthActiveLocale
} from 'zdp-auth-ui/i18n';
import { cancelPasskeyCeremony, detectPasskeySupport, startPasskeyAuthentication, startPasskeyRegistration,
  ZdpPasskeyCeremonyError, type ZdpPasskeyAuthenticationOptions, type ZdpPasskeyCeremonyOptions,
  type ZdpPasskeySupport, type ZdpAuthAvailability, type LoginIdFieldProps,
  PasskeySettings, getPasskeySettingsMessages, validPasskeyLabel, type AuthShellProps,
  type PasskeySettingsProps, type ZdpPasskeySettingsState } from 'zdp-auth-ui';
import koMessages, { passkeySettingsMessages } from 'zdp-auth-ui/i18n/ko';
import { loadAuthLocale, loadPasskeySettingsMessages } from 'zdp-auth-ui/i18n/loader';
import { createZdpAuthSurfaceModel as createLeanSurface, type ZdpAuthSurfaceConfig as LeanSurfaceConfig,
  type AuthShellProps as LeanShellProps, type PasskeySettingsProps as LeanPasskeyProps } from 'zdp-auth-ui/components';
import { createZdpAuthSurfaceModel, type ZdpAuthSurfaceConfig } from 'zdp-auth-ui';
import type { ComponentProps } from 'svelte';
import type * as LeanComponents from 'zdp-auth-ui/components';
import type * as LeanContract from 'zdp-auth-ui/contract';
import type * as LeanPasskey from 'zdp-auth-ui/passkey';
import type * as Root from 'zdp-auth-ui';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type RequireTrue<T extends true> = T;
type LeanPropsParity = [
  RequireTrue<Equal<LeanComponents.AuthShellProps, ComponentProps<typeof LeanComponents.AuthShell>>>,
  RequireTrue<Equal<LeanComponents.LoginIdFieldProps, ComponentProps<typeof LeanComponents.LoginIdField>>>,
  RequireTrue<Equal<LeanComponents.PasswordFieldProps, ComponentProps<typeof LeanComponents.PasswordField>>>,
  RequireTrue<Equal<LeanComponents.PasswordSignupFieldsProps, ComponentProps<typeof LeanComponents.PasswordSignupFields>>>,
  RequireTrue<Equal<LeanComponents.ProductLinkApprovalProps, ComponentProps<typeof LeanComponents.ProductLinkApproval>>>,
  RequireTrue<Equal<LeanComponents.ProviderButtonProps, ComponentProps<typeof LeanComponents.ProviderButton>>>,
  RequireTrue<Equal<LeanComponents.PasskeySettingsProps, ComponentProps<typeof LeanComponents.PasskeySettings>>>
];
type LeanContractParity = [
  RequireTrue<Equal<LeanContract.ZdpManagedPasskey, Root.ZdpManagedPasskey>>,
  RequireTrue<Equal<LeanContract.ZdpPasskeyAuthenticator, Root.ZdpPasskeyAuthenticator>>,
  RequireTrue<Equal<LeanContract.ZdpPasskeyAuthenticatorProvider, Root.ZdpPasskeyAuthenticatorProvider>>,
  RequireTrue<Equal<LeanContract.ZdpPasskeyAuthenticatorStorage, Root.ZdpPasskeyAuthenticatorStorage>>,
  RequireTrue<Equal<LeanContract.ZdpPasskeyRegistrationPreference, Root.ZdpPasskeyRegistrationPreference>>,
  RequireTrue<Equal<LeanContract.ZdpPasskeySettingsAction, Root.ZdpPasskeySettingsAction>>,
  RequireTrue<Equal<LeanContract.ZdpPasskeySettingsFeedback, Root.ZdpPasskeySettingsFeedback>>,
  RequireTrue<Equal<LeanContract.ZdpPasskeySettingsState, Root.ZdpPasskeySettingsState>>,
  RequireTrue<Equal<typeof LeanContract.validateProductLinkRequest, typeof Root.validateProductLinkRequest>>
];
type LeanPasskeyParity = [
  RequireTrue<Equal<LeanPasskey.ZdpPasskeyCeremonyOptions, Root.ZdpPasskeyCeremonyOptions>>,
  RequireTrue<Equal<LeanPasskey.ZdpPasskeyAuthenticationOptions, Root.ZdpPasskeyAuthenticationOptions>>,
  RequireTrue<Equal<LeanPasskey.ZdpPasskeySupport, Root.ZdpPasskeySupport>>,
  RequireTrue<Equal<LeanPasskey.ZdpPasskeyAuthenticationMediation, Root.ZdpPasskeyAuthenticationMediation>>,
  RequireTrue<Equal<LeanPasskey.ZdpPasskeyCeremonyKind, Root.ZdpPasskeyCeremonyKind>>,
  RequireTrue<Equal<LeanPasskey.ZdpPasskeyErrorReason, Root.ZdpPasskeyErrorReason>>,
  RequireTrue<Equal<typeof LeanPasskey.startPasskeyAuthentication, typeof Root.startPasskeyAuthentication>>,
  RequireTrue<Equal<typeof LeanPasskey.startPasskeyRegistration, typeof Root.startPasskeyRegistration>>
];

const surfaceConfig: ZdpAuthSurfaceConfig = { locale: 'ko', mode: 'login', availability: 'available' };
const injectedSurfaceConfig: LeanSurfaceConfig = { ...surfaceConfig, messages: koMessages };
const injectedSurface = createLeanSurface(injectedSurfaceConfig);
const injectedSurfaceProps: LeanShellProps = { ...injectedSurface.shell, messages: injectedSurface.messages };
const defaultSurface = createZdpAuthSurfaceModel(surfaceConfig);
const customSurface = createZdpAuthSurfaceModel(injectedSurfaceConfig);
// @ts-expect-error The catalog-free model builder must not silently load a default catalog.
const missingSurfaceMessages: LeanSurfaceConfig = { locale: 'ko', mode: 'login', availability: 'available' };
void [injectedSurfaceProps, defaultSurface, customSurface, missingSurfaceMessages];

const ceremonyOptions: ZdpPasskeyCeremonyOptions = { signal: new AbortController().signal, timeoutMs: 1000 };
const authenticationOptions: ZdpPasskeyAuthenticationOptions = {
  ...ceremonyOptions, mediation: 'conditional', container: document.createDocumentFragment()
};
const authenticate: (options: Parameters<typeof startPasskeyAuthentication>[0],
  ceremony?: ZdpPasskeyAuthenticationOptions) => Promise<unknown> = startPasskeyAuthentication;
const register: (options: Parameters<typeof startPasskeyRegistration>[0],
  ceremony?: ZdpPasskeyCeremonyOptions) => Promise<unknown> = startPasskeyRegistration;
const support: Promise<ZdpPasskeySupport> = detectPasskeySupport();
const cancel: () => void = cancelPasskeyCeremony;
const passkeyError: Error = new ZdpPasskeyCeremonyError('authentication', 'cancelled');
const availability: ZdpAuthAvailability = 'preparing';
const autofillField: LoginIdFieldProps = { id: 'login', name: 'login_id', autocomplete: 'username webauthn' };
// @ts-expect-error Conditional UI uses the webauthn token after username.
const invalidAutofill: LoginIdFieldProps = { id: 'login', name: 'login_id', autocomplete: 'webauthn' };
void [authenticate, register, support, cancel, passkeyError, availability, autofillField, invalidAutofill];

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
