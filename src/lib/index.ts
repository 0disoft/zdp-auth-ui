import type { ComponentProps } from 'svelte';

export { default as AuthShell } from './compat/AuthShell.svelte';
export { default as LoginIdField } from './compat/LoginIdField.svelte';
export { default as PasswordField } from './compat/PasswordField.svelte';
export { default as PasswordSignupFields } from './compat/PasswordSignupFields.svelte';
export { default as ProductLinkApproval } from './compat/ProductLinkApproval.svelte';
export { default as ProviderButton } from './components/ProviderButton.svelte';
export { default as PasskeySettings } from './compat/PasskeySettings.svelte';
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
export { getPasskeyRegistrationDefaultLabel, getPasskeySettingsMessages,
  type ZdpPasskeySettingsMessages } from './passkey-settings-messages';
export {
  createZdpAuthSurfaceModel,
  zdpAuthSurfaceProviderIds,
  type ZdpAuthSurfaceConfig,
  type ZdpAuthSurfaceLinks,
  type ZdpAuthSurfaceModel,
  type ZdpAuthSurfaceProviderFlags,
  type ZdpAuthSurfaceProviderId,
  type ZdpAuthSurfaceShellModel
} from './auth-surface-model';
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
  type ZdpAuthSubmitDetail
} from './auth-contract';
export {
  cancelPasskeyCeremony,
  detectPasskeySupport,
  startPasskeyAuthentication,
  startPasskeyRegistration,
  ZdpPasskeyCeremonyError,
  zdpPasskeyAuthenticationMediationModes,
  zdpPasskeyCeremonyKinds,
  zdpPasskeyErrorReasons,
  type ZdpPasskeyAuthenticationMediation,
  type ZdpPasskeyAuthenticationOptions,
  type ZdpPasskeyCeremonyKind,
  type ZdpPasskeyCeremonyOptions,
  type ZdpPasskeyErrorReason,
  type ZdpPasskeySupport
} from './passkey';
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

export type AuthShellProps = ComponentProps<typeof import('./compat/AuthShell.svelte').default>;
export type LoginIdFieldProps = ComponentProps<typeof import('./compat/LoginIdField.svelte').default>;
export type PasswordFieldProps = ComponentProps<typeof import('./compat/PasswordField.svelte').default>;
export type PasswordSignupFieldsProps = ComponentProps<typeof import('./compat/PasswordSignupFields.svelte').default>;
export type ProductLinkApprovalProps = ComponentProps<typeof import('./compat/ProductLinkApproval.svelte').default>;
export type ProviderButtonProps = ComponentProps<typeof import('./components/ProviderButton.svelte').default>;
export type PasskeySettingsProps = ComponentProps<typeof import('./compat/PasskeySettings.svelte').default>;
