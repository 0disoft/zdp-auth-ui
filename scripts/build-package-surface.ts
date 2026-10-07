import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');

async function writeStylesEntry(): Promise<void> {
  const sourceStyles = await readFile(join(root, 'src', 'styles', 'index.css'), 'utf8');
  const componentStyles =
    (await readOptionalFile(join(distDir, 'index.css'))) ||
    (await readOptionalFile(join(distDir, 'zdp-auth-ui.css')));
  const styles = componentStyles.trim()
    ? `${sourceStyles.trimEnd()}\n\n${componentStyles.trimStart()}`
    : sourceStyles;

  await writeFile(join(distDir, 'styles.css'), `${styles.trimEnd()}\n`, 'utf8');
}

async function writeDeclarationFiles(): Promise<void> {
  await Promise.all([
    writeFile(join(distDir, 'contract.d.ts'), contractDeclaration, 'utf8'),
    writeFile(join(distDir, 'i18n.d.ts'), i18nDeclaration, 'utf8'),
    writeFile(join(distDir, 'index.d.ts'), indexDeclaration, 'utf8')
  ]);
}

async function readOptionalFile(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return '';
    }

    throw error;
  }
}

const contractDeclaration = `export declare const zdpAuthModes: readonly ["login", "signup", "recovery"];
export type ZdpAuthMode = (typeof zdpAuthModes)[number];
export declare const zdpAuthAvailabilityStates: readonly ["available", "preparing"];
export type ZdpAuthAvailability = (typeof zdpAuthAvailabilityStates)[number];
export declare const zdpAuthFeedbackCodes: readonly ["waiting", "registered", "invalid_input", "invalid_credentials", "rate_limited", "expired", "unavailable"];
export type ZdpAuthFeedbackCode = (typeof zdpAuthFeedbackCodes)[number];
export declare const zdpAuthFeedbackErrorCodes: readonly ["invalid_input", "invalid_credentials", "rate_limited", "expired", "unavailable"];
export type ZdpAuthFeedbackErrorCode = (typeof zdpAuthFeedbackErrorCodes)[number];
export interface ZdpAuthFeedback {
  readonly code: ZdpAuthFeedbackCode;
  readonly sequence?: number;
}
export declare function isZdpAuthFeedbackCode(candidate: unknown): candidate is ZdpAuthFeedbackCode;
export declare function isZdpAuthFeedbackErrorCode(candidate: unknown): candidate is ZdpAuthFeedbackErrorCode;
export declare const zdpAuthHandoffModes: readonly ["login", "signup"];
export declare const zdpAuthHandoffProductIds: readonly ["melamed"];
export type ZdpAuthHandoffMode = (typeof zdpAuthHandoffModes)[number];
export type ZdpAuthHandoffProductId = (typeof zdpAuthHandoffProductIds)[number];
export declare const zdpAuthHandoffReturnPathRegistry: Readonly<{
  readonly melamed: readonly ["/apply"];
}>;
export interface ZdpAuthHandoffRequest {
  readonly mode: ZdpAuthHandoffMode;
  readonly productId: ZdpAuthHandoffProductId;
  readonly trustedAuthOrigin: string;
  readonly returnPath: string;
}
export type ZdpAuthHandoffRejectionReason = "invalid-request" | "unsupported-mode" | "invalid-auth-origin" | "untrusted-product" | "invalid-return-path" | "malformed-return-path-encoding" | "noncanonical-return-path" | "unsafe-return-path" | "unregistered-return-path" | "query-too-long";
export type ZdpAuthHandoffResult = {
  readonly outcome: "created";
  readonly url: string;
} | {
  readonly outcome: "rejected";
  readonly reason: ZdpAuthHandoffRejectionReason;
};
export declare function buildZdpAuthHandoffUrl(request: ZdpAuthHandoffRequest): ZdpAuthHandoffResult;
export declare const zdpAuthProviderKinds: readonly ["passkey", "oauth", "email"];
export type ZdpAuthProviderKind = (typeof zdpAuthProviderKinds)[number];
export interface ZdpAuthProvider {
  readonly id: string;
  readonly label: string;
  readonly kind?: ZdpAuthProviderKind;
  readonly iconLabel?: string;
  readonly disabled?: boolean;
}
export interface ZdpAuthSubmitDetail {
  readonly mode: ZdpAuthMode;
  readonly form: HTMLFormElement;
  readonly referralCode: string | null;
}
export interface ZdpAuthProviderSelectDetail {
  readonly provider: ZdpAuthProvider;
}
export interface ZdpAuthModeChangeDetail {
  readonly mode: ZdpAuthMode;
}
export declare const zdpPasswordSignupFieldNames: Readonly<{
  readonly loginId: "login_id";
  readonly password: "password";
  readonly termsAccepted: "terms_accepted";
  readonly termsConsentRef: "terms_consent_ref";
  readonly locale: "locale";
}>;
export interface ZdpPasswordSignupContractRequest {
  readonly termsConsentRef: string;
  readonly locale: import('./i18n').ZdpAuthLocale | string;
}
export interface ZdpPasswordSignupContract {
  readonly termsConsentRef: string;
  readonly locale: import('./i18n').ZdpAuthLocale;
  readonly fieldNames: typeof zdpPasswordSignupFieldNames;
}
export type ZdpPasswordSignupContractResult = {
  readonly outcome: "created";
  readonly contract: ZdpPasswordSignupContract;
} | {
  readonly outcome: "rejected";
  readonly reason: "invalid-terms-consent-ref" | "unsupported-locale";
};
export declare function createZdpPasswordSignupContract(request: ZdpPasswordSignupContractRequest): ZdpPasswordSignupContractResult;
export declare const zdpProductLinkStates: readonly ["pending", "approved", "denied", "expired", "consumed"];
export declare const zdpProductLinkItemKinds: readonly ["scope", "capability"];
export declare const zdpProductLinkDecisions: readonly ["approve", "deny"];
export type ZdpProductLinkState = (typeof zdpProductLinkStates)[number];
export type ZdpProductLinkItemKind = (typeof zdpProductLinkItemKinds)[number];
export type ZdpProductLinkDecision = (typeof zdpProductLinkDecisions)[number];
export interface ZdpProductLinkRequestedItem {
  readonly ref: string;
  readonly kind: ZdpProductLinkItemKind;
  readonly label: string;
  readonly description: string;
}
export interface ZdpProductLinkRequest {
  readonly challengeRef: string;
  readonly verificationUri: string;
  readonly state: ZdpProductLinkState;
  readonly productLabel: string;
  readonly requestedItems: readonly ZdpProductLinkRequestedItem[];
  readonly accountLabel: string;
  readonly workspaceLabel: string | null;
  readonly consentImplications: readonly string[];
  readonly issuedAt: string;
  readonly expiresAt: string;
}
export interface ZdpProductLinkTrustPolicy {
  readonly expectedChallengeRef: string;
  readonly expectedVerificationUri: string;
  readonly allowedVerificationOrigins: readonly string[];
  readonly verificationPath: string;
  readonly maxRequestAgeMs: number;
}
export type ZdpProductLinkDisposition = "ready" | "approved" | "denied" | "expired" | "consumed" | "stale" | "invalid";
export interface ZdpProductLinkValidation {
  readonly disposition: ZdpProductLinkDisposition;
  readonly actionable: boolean;
}
export interface ZdpProductLinkDecisionDetail {
  readonly challengeRef: string;
  readonly decision: ZdpProductLinkDecision;
}
`;

const i18nDeclaration = `export declare const zdpAuthTargetLocales: readonly ["en", "zh", "es", "fr", "hi", "ko", "ja", "vi", "ru", "id", "ms", "th"];
export declare const zdpAuthActiveLocales: readonly ["ko", "en"];
export declare const zdpAuthPlannedLocales: readonly ["zh", "es", "fr", "hi", "ja", "vi", "ru", "id", "ms", "th"];
export type ZdpAuthLocale = (typeof zdpAuthTargetLocales)[number];
export type ZdpAuthActiveLocale = (typeof zdpAuthActiveLocales)[number];
export type ZdpAuthPlannedLocale = (typeof zdpAuthPlannedLocales)[number];
export interface ZdpAuthMessages {
  readonly brand: string;
  readonly title: {
    readonly login: string;
    readonly signup: string;
    readonly recovery: string;
  };
  readonly summary: {
    readonly login: string;
    readonly signup: string;
    readonly recovery: string;
  };
  readonly fields: {
    readonly loginId: string;
    readonly email: string;
    readonly password: string;
    readonly passwordConfirmation: string;
    readonly name: string;
    readonly termsAcceptance: string;
  };
  readonly actions: {
    readonly login: string;
    readonly signup: string;
    readonly recovery: string;
    readonly usePasskey: string;
    readonly showPassword: string;
    readonly hidePassword: string;
  };
  readonly providers: {
    readonly groupLabel: string;
    readonly passkey: string;
    readonly google: string;
    readonly github: string;
    readonly email: string;
  };
  readonly navigation: {
    readonly accountHelp: string;
  };
  readonly links: {
    readonly login: string;
    readonly signup: string;
    readonly recovery: string;
    readonly terms: string;
    readonly privacy: string;
  };
  readonly status: {
    readonly waiting: string;
    readonly error: string;
  };
  readonly availability: {
    readonly preparing: string;
  };
  readonly feedback: {
    readonly registered: string;
    readonly invalidInput: string;
    readonly expiredPage: string;
    readonly signupUnavailable: string;
    readonly loginFailed: string;
    readonly loginUnavailable: string;
    readonly passwordMismatch: string;
  };
  readonly productLink: {
    readonly title: string;
    readonly summary: string;
    readonly fields: {
      readonly product: string;
      readonly account: string;
      readonly workspace: string;
      readonly expires: string;
    };
    readonly requestedTitle: string;
    readonly itemKinds: {
      readonly scope: string;
      readonly capability: string;
    };
    readonly consentTitle: string;
    readonly consentBoundary: string;
    readonly noWorkspace: string;
    readonly actions: {
      readonly approve: string;
      readonly deny: string;
    };
    readonly status: {
      readonly ready: string;
      readonly submitting: string;
      readonly approved: string;
      readonly denied: string;
      readonly expired: string;
      readonly consumed: string;
      readonly stale: string;
      readonly invalid: string;
      readonly disabled: string;
    };
  };
}
export declare const zdpAuthMessages: Record<ZdpAuthLocale, ZdpAuthMessages>;
export declare function isActiveAuthLocale(locale: string): locale is ZdpAuthActiveLocale;
export declare function getAuthMessages(locale: ZdpAuthLocale | string): ZdpAuthMessages;
`;

const indexDeclaration = `import type { Component, Snippet } from 'svelte';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON
} from '@simplewebauthn/browser';
export declare const zdpPasskeyCeremonyKinds: readonly ["authentication", "registration"];
export type ZdpPasskeyCeremonyKind = (typeof zdpPasskeyCeremonyKinds)[number];
export declare const zdpPasskeyAuthenticationMediationModes: readonly ["modal", "conditional"];
export type ZdpPasskeyAuthenticationMediation = (typeof zdpPasskeyAuthenticationMediationModes)[number];
export declare const zdpPasskeyErrorReasons: readonly ["unsupported", "conditional-ui-unsupported", "conditional-input-missing", "cancelled", "timed-out", "not-allowed", "security-error", "invalid-options", "authenticator-error", "unknown"];
export type ZdpPasskeyErrorReason = (typeof zdpPasskeyErrorReasons)[number];
export interface ZdpPasskeySupport {
  readonly supported: boolean;
  readonly conditionalUi: boolean;
  readonly platformAuthenticator: boolean;
}
export interface ZdpPasskeyCeremonyOptions {
  readonly timeoutMs?: number;
}
export interface ZdpPasskeyAuthenticationOptions extends ZdpPasskeyCeremonyOptions {
  readonly mediation?: ZdpPasskeyAuthenticationMediation;
  readonly verifyBrowserAutofillInput?: boolean;
}
export declare class ZdpPasskeyCeremonyError extends Error {
  readonly name: "ZdpPasskeyCeremonyError";
  readonly reason: ZdpPasskeyErrorReason;
  readonly ceremony: ZdpPasskeyCeremonyKind;
  constructor(ceremony: ZdpPasskeyCeremonyKind, reason: ZdpPasskeyErrorReason, cause?: unknown);
}
export {
  getAuthMessages,
  isActiveAuthLocale,
  zdpAuthActiveLocales,
  zdpAuthMessages,
  zdpAuthPlannedLocales,
  zdpAuthTargetLocales,
  type ZdpAuthActiveLocale,
  type ZdpAuthLocale,
  type ZdpAuthMessages,
  type ZdpAuthPlannedLocale
} from './i18n';
export {
  buildZdpAuthHandoffUrl,
  isZdpAuthFeedbackCode,
  isZdpAuthFeedbackErrorCode,
  zdpAuthAvailabilityStates,
  zdpAuthFeedbackCodes,
  zdpAuthFeedbackErrorCodes,
  zdpAuthModes,
  zdpAuthHandoffModes,
  zdpAuthHandoffProductIds,
  zdpAuthHandoffReturnPathRegistry,
  zdpAuthProviderKinds,
  type ZdpAuthAvailability,
  type ZdpAuthFeedback,
  type ZdpAuthFeedbackCode,
  type ZdpAuthFeedbackErrorCode,
  type ZdpAuthMode,
  type ZdpAuthModeChangeDetail,
  type ZdpAuthHandoffMode,
  type ZdpAuthHandoffProductId,
  type ZdpAuthHandoffRejectionReason,
  type ZdpAuthHandoffRequest,
  type ZdpAuthHandoffResult,
  type ZdpAuthProvider,
  type ZdpAuthProviderKind,
  type ZdpAuthProviderSelectDetail,
  type ZdpAuthSubmitDetail,
  createZdpPasswordSignupContract,
  zdpPasswordSignupFieldNames,
  type ZdpPasswordSignupContract,
  type ZdpPasswordSignupContractRequest,
  type ZdpPasswordSignupContractResult,
  zdpProductLinkDecisions,
  zdpProductLinkItemKinds,
  zdpProductLinkStates,
  type ZdpProductLinkDecision,
  type ZdpProductLinkDecisionDetail,
  type ZdpProductLinkDisposition,
  type ZdpProductLinkItemKind,
  type ZdpProductLinkRequest,
  type ZdpProductLinkRequestedItem,
  type ZdpProductLinkState,
  type ZdpProductLinkTrustPolicy,
  type ZdpProductLinkValidation
} from './contract';
import type {
  ZdpAuthAvailability,
  ZdpAuthFeedback,
  ZdpAuthMode,
  ZdpAuthModeChangeDetail,
  ZdpAuthHandoffRequest,
  ZdpAuthHandoffResult,
  ZdpAuthProvider,
  ZdpAuthProviderSelectDetail,
  ZdpAuthSubmitDetail,
  ZdpPasswordSignupContract,
  ZdpProductLinkDecisionDetail,
  ZdpProductLinkRequest,
  ZdpProductLinkTrustPolicy,
  ZdpProductLinkValidation
} from './contract';
import type { ZdpAuthLocale, ZdpAuthMessages } from './i18n';
export declare const zdpAuthSurfaceProviderIds: readonly ["passkey", "google", "github", "email"];
export type ZdpAuthSurfaceProviderId = (typeof zdpAuthSurfaceProviderIds)[number];
export type ZdpAuthSurfaceProviderFlags = Readonly<Partial<Record<ZdpAuthSurfaceProviderId, boolean>>>;
export interface ZdpAuthSurfaceLinks {
  readonly recoveryHref?: string | null;
  readonly termsHref?: string | null;
  readonly privacyHref?: string | null;
}
export interface ZdpAuthSurfaceConfig {
  readonly locale: ZdpAuthLocale | string;
  readonly mode: ZdpAuthMode;
  readonly availability: ZdpAuthAvailability;
  readonly accountBrand?: string | null;
  readonly providerFlags?: ZdpAuthSurfaceProviderFlags;
  readonly links?: ZdpAuthSurfaceLinks;
}
export interface ZdpAuthSurfaceShellModel {
  readonly locale: ZdpAuthLocale | string;
  readonly mode: ZdpAuthMode;
  readonly availability: ZdpAuthAvailability;
  readonly accountBrand: string | null;
  readonly providers: readonly ZdpAuthProvider[];
  readonly recoveryHref: string | null;
  readonly termsHref: string | null;
  readonly privacyHref: string | null;
}
export interface ZdpAuthSurfaceModel {
  readonly messages: ZdpAuthMessages;
  readonly shell: ZdpAuthSurfaceShellModel;
}
export declare function createZdpAuthSurfaceModel(config: ZdpAuthSurfaceConfig): ZdpAuthSurfaceModel;
export interface AuthShellProps {
  readonly locale?: ZdpAuthLocale | string;
  readonly mode?: ZdpAuthMode;
  readonly availability?: ZdpAuthAvailability;
  readonly busy?: boolean;
  readonly accountBrand?: string | null;
  readonly providers?: readonly ZdpAuthProvider[];
  readonly action?: string | null;
  readonly method?: 'post';
  readonly feedback?: ZdpAuthFeedback | null;
  readonly status?: string | null;
  readonly invalid?: boolean;
  readonly referralCode?: string | null;
  readonly referralCodeFieldName?: string;
  readonly recoveryHref?: string | null;
  readonly termsHref?: string | null;
  readonly signupTermsInSlot?: boolean;
  readonly privacyHref?: string | null;
  readonly onsubmit?: ((detail: ZdpAuthSubmitDetail, event: SubmitEvent) => void) | null;
  readonly onproviderselect?: ((detail: ZdpAuthProviderSelectDetail, event: MouseEvent) => void) | null;
  readonly onmodechange?: ((detail: ZdpAuthModeChangeDetail, event: MouseEvent) => void) | null;
  readonly children?: Snippet;
}
export interface PasswordFieldProps {
  readonly id: string;
  readonly name: string;
  readonly label?: string | null;
  readonly value?: string;
  readonly locale?: ZdpAuthLocale | string;
  readonly autocomplete?: 'current-password' | 'new-password';
  readonly describedBy?: string | readonly string[] | null;
  readonly helpText?: string | null;
  readonly errorText?: string | null;
  readonly required?: boolean;
  readonly disabled?: boolean;
}
export interface LoginIdFieldProps {
  readonly id: string;
  readonly name?: string;
  readonly label?: string | null;
  readonly value?: string;
  readonly locale?: ZdpAuthLocale | string;
  readonly autocomplete?: 'username' | 'username webauthn';
  readonly describedBy?: string | readonly string[] | null;
  readonly helpText?: string | null;
  readonly errorText?: string | null;
  readonly required?: boolean;
  readonly disabled?: boolean;
}
export interface PasswordSignupFieldsProps {
  readonly idPrefix: string;
  readonly contract: ZdpPasswordSignupContract;
  readonly loginId?: string;
  readonly password?: string;
  readonly termsAccepted?: boolean;
  readonly disabled?: boolean;
  readonly loginIdError?: string | null;
  readonly passwordError?: string | null;
}
export interface ProviderButtonProps {
  readonly provider: ZdpAuthProvider;
  readonly disabled?: boolean;
  readonly onclick?: ((provider: ZdpAuthProvider, event: MouseEvent) => void) | null;
}
export interface ProductLinkApprovalProps {
  readonly id: string;
  readonly locale?: ZdpAuthLocale | string;
  readonly enabled?: boolean;
  readonly request: ZdpProductLinkRequest;
  readonly trust: ZdpProductLinkTrustPolicy;
  readonly now?: Date | null;
  readonly busy?: boolean;
  readonly ondecision?: ((detail: ZdpProductLinkDecisionDetail, event: MouseEvent) => void) | null;
}
export declare const AuthShell: Component<AuthShellProps>;
export declare const LoginIdField: Component<LoginIdFieldProps>;
export declare const PasswordField: Component<PasswordFieldProps>;
export declare const PasswordSignupFields: Component<PasswordSignupFieldsProps>;
export declare const ProductLinkApproval: Component<ProductLinkApprovalProps>;
export declare const ProviderButton: Component<ProviderButtonProps>;
export declare function buildZdpAuthHandoffUrl(request: ZdpAuthHandoffRequest): ZdpAuthHandoffResult;
export declare function validateProductLinkRequest(
  request: ZdpProductLinkRequest,
  trust: ZdpProductLinkTrustPolicy,
  now?: Date
): ZdpProductLinkValidation;
export declare function detectPasskeySupport(): Promise<ZdpPasskeySupport>;
export declare function startPasskeyRegistration(
  options: PublicKeyCredentialCreationOptionsJSON,
  ceremonyOptions?: ZdpPasskeyCeremonyOptions
): Promise<RegistrationResponseJSON>;
export declare function startPasskeyAuthentication(
  options: PublicKeyCredentialRequestOptionsJSON,
  ceremonyOptions?: ZdpPasskeyAuthenticationOptions
): Promise<AuthenticationResponseJSON>;
export declare function cancelPasskeyCeremony(): void;
export declare const zdpPasskeyAuthenticatorProviders: readonly ["windows_hello", "google_password_manager", "bitwarden", "apple_passwords", "unknown"];
export type ZdpPasskeyAuthenticatorProvider = (typeof zdpPasskeyAuthenticatorProviders)[number];
export declare const zdpPasskeyAuthenticatorStorages: readonly ["synced", "device_bound"];
export type ZdpPasskeyAuthenticatorStorage = (typeof zdpPasskeyAuthenticatorStorages)[number];
export interface ZdpPasskeyAuthenticator {
  readonly provider: ZdpPasskeyAuthenticatorProvider;
  readonly storage: ZdpPasskeyAuthenticatorStorage;
  readonly backed_up: boolean;
}
export interface ZdpManagedPasskey {
  readonly passkey_id: string;
  readonly label: string;
  readonly created_at: string;
  readonly last_used_at: string | null;
  readonly authenticator?: ZdpPasskeyAuthenticator;
}
export declare const zdpPasskeyRegistrationPreferences: readonly ["device", "manager", "security_key", "phone"];
export type ZdpPasskeyRegistrationPreference = (typeof zdpPasskeyRegistrationPreferences)[number];
export declare const zdpPasskeyRegistrationPreferenceDefault: ZdpPasskeyRegistrationPreference;
export interface ZdpPasskeySettingsState {
  readonly status: 'ready' | 'preparing' | 'unavailable';
  readonly passkeys: readonly ZdpManagedPasskey[];
  readonly capabilities: { readonly register: boolean; readonly rename: boolean; readonly revoke: boolean };
  readonly reauthentication: 'password' | 'passkey';
}
export type ZdpPasskeySettingsAction =
  ({ readonly action: 'register'; readonly label: string; readonly preference?: ZdpPasskeyRegistrationPreference; readonly currentPassword?: string }
  | { readonly action: 'rename'; readonly passkeyId: string; readonly label: string }
  | { readonly action: 'revoke'; readonly passkeyId: string; readonly currentPassword?: string })
  & { readonly sequence?: number };
export declare function isZdpPasskeyAuthenticatorProvider(value: unknown): value is ZdpPasskeyAuthenticatorProvider;
export declare function isZdpPasskeyAuthenticatorStorage(value: unknown): value is ZdpPasskeyAuthenticatorStorage;
export declare function isZdpPasskeyRegistrationPreference(value: unknown): value is ZdpPasskeyRegistrationPreference;
export type ZdpPasskeySettingsFeedback = 'saved' | 'failed' | 'unconfirmed' | 'expired' | 'rate_limited' | null;
export interface PasskeySettingsProps {
  readonly locale?: string;
  readonly idPrefix?: string;
  readonly state?: ZdpPasskeySettingsState;
  readonly busy?: boolean;
  readonly feedback?: ZdpPasskeySettingsFeedback;
  readonly feedbackSequence?: number | null;
  readonly onaction?: ((detail: ZdpPasskeySettingsAction, event: SubmitEvent) => void) | null;
}
export declare const PasskeySettings: Component<PasskeySettingsProps>;
export type ZdpPasskeySettingsMessages = Readonly<Record<'title' | 'description' | 'add' | 'rename' | 'remove' | 'name' | 'save' | 'cancel' | 'confirmRemove' | 'reauthPassword' | 'reauthPasskey' | 'removeHelp' | 'empty' | 'preparing' | 'unavailable' | 'created' | 'lastUsed' | 'neverUsed' | 'invalidName' | 'currentPassword' | 'saved' | 'failed' | 'unconfirmed' | 'expired' | 'rate_limited' | 'waiting' | 'invalidPassword' | 'providerWindowsHello' | 'providerGooglePasswordManager' | 'providerBitwarden' | 'providerApplePasswords' | 'providerUnknown' | 'storageSynced' | 'storageDeviceBound' | 'backedUp' | 'notBackedUp' | 'preferenceLabel' | 'preferenceHelp' | 'preferenceDevice' | 'preferenceManager' | 'preferenceSecurityKey' | 'preferencePhone' | 'defaultNameDevice' | 'defaultNameManager' | 'defaultNameSecurityKey' | 'defaultNamePhone' | 'storageUnknown', string>>;
export declare function getPasskeySettingsMessages(locale: string): ZdpPasskeySettingsMessages;
export declare function getPasskeyRegistrationDefaultLabel(locale: string, preference: ZdpPasskeyRegistrationPreference): string;
export declare function validPasskeyLabel(value: string): boolean;
`;

await mkdir(distDir, { recursive: true });
await writeStylesEntry();
await writeDeclarationFiles();
