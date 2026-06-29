export const zdpAuthModes = ['login', 'signup', 'recovery'] as const;
export type ZdpAuthMode = (typeof zdpAuthModes)[number];

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
