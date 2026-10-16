import type {
  ZdpAuthAvailability,
  ZdpAuthMode,
  ZdpAuthProvider,
  ZdpAuthProviderKind
} from './auth-contract';
import type { ZdpAuthLocale, ZdpAuthMessages } from './i18n/schema';

export const zdpAuthSurfaceProviderIds = Object.freeze([
  'passkey',
  'google',
  'github',
  'email'
] as const);

export type ZdpAuthSurfaceProviderId = (typeof zdpAuthSurfaceProviderIds)[number];

export type ZdpAuthSurfaceProviderFlags = Readonly<
  Partial<Record<ZdpAuthSurfaceProviderId, boolean>>
>;

export interface ZdpAuthSurfaceLinks {
  readonly recoveryHref?: string | null;
  readonly termsHref?: string | null;
  readonly privacyHref?: string | null;
}

export interface ZdpAuthSurfaceConfig {
  readonly locale: ZdpAuthLocale | string;
  readonly messages: ZdpAuthMessages;
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

const providerKinds: Readonly<Record<ZdpAuthSurfaceProviderId, ZdpAuthProviderKind>> = Object.freeze({
  passkey: 'passkey',
  google: 'oauth',
  github: 'oauth',
  email: 'email'
});
const emptyProviders: readonly ZdpAuthProvider[] = Object.freeze([]);

/*
 * mf:anchor zdp.auth-ui.surface-model
 * purpose: Compose stable AuthShell props and localized built-in providers from trusted consumer feature configuration.
 * search: auth surface model, provider flags, AuthShell props, product auth configuration
 * invariant: Composition is pure and display-only; it never selects auth authority, trusts an origin, calls a route, or reads auth state.
 * risk: authn, config, privacy
 */
export function createZdpAuthSurfaceModel(config: ZdpAuthSurfaceConfig): ZdpAuthSurfaceModel {
  const messages = config.messages;
  const providers = config.mode === 'recovery'
    ? emptyProviders
    : buildProviders(config.providerFlags, messages);
  const shell: ZdpAuthSurfaceShellModel = Object.freeze({
    locale: config.locale,
    mode: config.mode,
    availability: config.availability,
    accountBrand: config.accountBrand ?? null,
    providers,
    recoveryHref: config.mode === 'login'
      ? normalizeOptionalLink(config.links?.recoveryHref)
      : null,
    termsHref: normalizeOptionalLink(config.links?.termsHref),
    privacyHref: normalizeOptionalLink(config.links?.privacyHref)
  });

  return Object.freeze({ messages, shell });
}

function buildProviders(
  flags: ZdpAuthSurfaceProviderFlags | undefined,
  messages: ZdpAuthMessages
): readonly ZdpAuthProvider[] {
  const providers: ZdpAuthProvider[] = [];

  for (const id of zdpAuthSurfaceProviderIds) {
    if (flags?.[id] !== true) {
      continue;
    }

    const provider: ZdpAuthProvider = Object.freeze({
      id,
      label: messages.providers[id],
      kind: providerKinds[id]
    });
    providers.push(provider);
  }

  return Object.freeze(providers);
}

function normalizeOptionalLink(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
