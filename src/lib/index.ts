export { default as AuthShell } from './components/AuthShell.svelte';
export { default as LoginIdField } from './components/LoginIdField.svelte';
export { default as PasswordField } from './components/PasswordField.svelte';
export { default as PasswordSignupFields } from './components/PasswordSignupFields.svelte';
export { default as ProductLinkApproval } from './components/ProductLinkApproval.svelte';
export { default as ProviderButton } from './components/ProviderButton.svelte';
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
  startPasskeyAuthentication,
  startPasskeyRegistration
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
