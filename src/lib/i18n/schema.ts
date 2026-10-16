export const zdpAuthTargetLocales = ['en', 'zh', 'es', 'fr', 'hi', 'ko', 'ja', 'vi', 'ru', 'id', 'ms', 'th'] as const;
export const zdpAuthActiveLocales = ['ko', 'en'] as const;
export const zdpAuthPlannedLocales = ['zh', 'es', 'fr', 'hi', 'ja', 'vi', 'ru', 'id', 'ms', 'th'] as const;

/*
 * mf:anchor zdp.auth-ui.message-catalog
 * purpose: Locate auth UI message catalogs and active/planned locale boundaries for reusable client auth surfaces.
 * search: auth messages, active locales, planned locales, login copy, provider labels
 * invariant: User-visible auth copy stays message-keyed and product-facing, with no implementation or server-authority text in labels.
 * risk: authn, privacy, config
 */
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
    readonly minimumAgeConfirmation: string;
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

export interface ZdpPasskeySettingsMessages {
  readonly title: string;
  readonly description: string;
  readonly add: string;
  readonly rename: string;
  readonly remove: string;
  readonly name: string;
  readonly save: string;
  readonly cancel: string;
  readonly confirmRemove: string;
  readonly reauthPassword: string;
  readonly reauthPasskey: string;
  readonly removeHelp: string;
  readonly empty: string;
  readonly preparing: string;
  readonly unavailable: string;
  readonly created: string;
  readonly lastUsed: string;
  readonly neverUsed: string;
  readonly invalidName: string;
  readonly currentPassword: string;
  readonly saved: string;
  readonly failed: string;
  readonly unconfirmed: string;
  readonly expired: string;
  readonly rate_limited: string;
  readonly waiting: string;
  readonly invalidPassword: string;
  readonly providerWindowsHello: string;
  readonly providerGooglePasswordManager: string;
  readonly providerBitwarden: string;
  readonly providerApplePasswords: string;
  readonly providerUnknown: string;
  readonly storageSynced: string;
  readonly storageDeviceBound: string;
  readonly backedUp: string;
  readonly notBackedUp: string;
  readonly preferenceLabel: string;
  readonly preferenceHelp: string;
  readonly preferenceDevice: string;
  readonly preferenceManager: string;
  readonly preferenceSecurityKey: string;
  readonly preferencePhone: string;
  readonly defaultNameDevice: string;
  readonly defaultNameManager: string;
  readonly defaultNameSecurityKey: string;
  readonly defaultNamePhone: string;
  readonly storageUnknown: string;
}
