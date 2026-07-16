export const zdpAuthModes = ['login', 'signup', 'recovery'] as const;
export type ZdpAuthMode = (typeof zdpAuthModes)[number];

/*
 * mf:anchor zdp.auth-ui.public-auth-contract
 * purpose: Locate the reusable auth UI event and provider contract shared by Astro, SvelteKit, and Tauri consumers.
 * search: auth modes, provider selection, submit detail, mode change, reusable auth UI
 * invariant: UI contracts describe browser interaction only and never own identity, session, permission, or token truth.
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
