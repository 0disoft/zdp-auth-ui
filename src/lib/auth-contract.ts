export const zdpAuthModes = ['login', 'signup', 'recovery'] as const;
export type ZdpAuthMode = (typeof zdpAuthModes)[number];

export const zdpAuthAvailabilityStates = ['available', 'preparing'] as const;
export type ZdpAuthAvailability = (typeof zdpAuthAvailabilityStates)[number];

export const zdpAuthFeedbackCodes = [
  'waiting',
  'registered',
  'invalid_input',
  'invalid_credentials',
  'rate_limited',
  'expired',
  'unavailable'
] as const;
export type ZdpAuthFeedbackCode = (typeof zdpAuthFeedbackCodes)[number];

export const zdpAuthFeedbackErrorCodes = [
  'invalid_input',
  'invalid_credentials',
  'rate_limited',
  'expired',
  'unavailable'
] as const;
export type ZdpAuthFeedbackErrorCode = (typeof zdpAuthFeedbackErrorCodes)[number];

export interface ZdpAuthFeedback {
  readonly code: ZdpAuthFeedbackCode;
  readonly sequence?: number;
}

export function isZdpAuthFeedbackCode(candidate: unknown): candidate is ZdpAuthFeedbackCode {
  return typeof candidate === 'string'
    && (zdpAuthFeedbackCodes as readonly string[]).includes(candidate);
}

export function isZdpAuthFeedbackErrorCode(candidate: unknown): candidate is ZdpAuthFeedbackErrorCode {
  return typeof candidate === 'string'
    && (zdpAuthFeedbackErrorCodes as readonly string[]).includes(candidate);
}

/*
 * mf:anchor zdp.auth-ui.public-auth-contract
 * purpose: Locate the reusable auth UI event, provider, and typed feedback contract shared by Astro, SvelteKit, and Tauri consumers.
 * search: auth modes, provider selection, submit detail, mode change, typed feedback, reusable auth UI
 * invariant: UI contracts describe browser interaction only and never own identity, session, permission, token, or server-error truth.
 * risk: authn, authz, privacy
 */
export const zdpAuthProviderKinds = ['passkey', 'oauth', 'email'] as const;
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

export {
  buildZdpAuthHandoffUrl,
  zdpAuthHandoffModes,
  zdpAuthHandoffProductIds,
  zdpAuthHandoffReturnPathRegistry,
  type ZdpAuthHandoffMode,
  type ZdpAuthHandoffProductId,
  type ZdpAuthHandoffRejectionReason,
  type ZdpAuthHandoffRequest,
  type ZdpAuthHandoffResult
} from './auth-handoff';

export {
  validateProductLinkRequest,
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
} from './product-link';

export {
  createZdpPasswordSignupContract,
  zdpPasswordSignupFieldNames,
  type ZdpPasswordSignupContract,
  type ZdpPasswordSignupContractRequest,
  type ZdpPasswordSignupContractResult
} from './password-signup';

export {
  isZdpPasskeyAuthenticatorProvider,
  isZdpPasskeyAuthenticatorStorage,
  isZdpPasskeyRegistrationPreference,
  validPasskeyLabel,
  zdpPasskeyAuthenticatorProviders,
  zdpPasskeyAuthenticatorStorages,
  zdpPasskeyRegistrationPreferenceDefault,
  zdpPasskeyRegistrationPreferences,
  type ZdpManagedPasskey,
  type ZdpPasskeyAuthenticator,
  type ZdpPasskeyAuthenticatorProvider,
  type ZdpPasskeyAuthenticatorStorage,
  type ZdpPasskeyRegistrationPreference,
  type ZdpPasskeySettingsAction,
  type ZdpPasskeySettingsFeedback,
  type ZdpPasskeySettingsState
} from './passkey-settings-contract';
