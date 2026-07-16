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
    readonly email: string;
    readonly password: string;
    readonly name: string;
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
export declare const zdpAuthMessages: Record<ZdpAuthActiveLocale, ZdpAuthMessages>;
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
  zdpAuthModes,
  zdpAuthProviderKinds,
  type ZdpAuthMode,
  type ZdpAuthModeChangeDetail,
  type ZdpAuthProvider,
  type ZdpAuthProviderKind,
  type ZdpAuthProviderSelectDetail,
  type ZdpAuthSubmitDetail,
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
  ZdpAuthMode,
  ZdpAuthModeChangeDetail,
  ZdpAuthProvider,
  ZdpAuthProviderSelectDetail,
  ZdpAuthSubmitDetail,
  ZdpProductLinkDecisionDetail,
  ZdpProductLinkRequest,
  ZdpProductLinkTrustPolicy,
  ZdpProductLinkValidation
} from './contract';
import type { ZdpAuthLocale } from './i18n';
export interface AuthShellProps {
  readonly locale?: ZdpAuthLocale | string;
  readonly mode?: ZdpAuthMode;
  readonly providers?: readonly ZdpAuthProvider[];
  readonly action?: string | null;
  readonly method?: 'post';
  readonly status?: string | null;
  readonly invalid?: boolean;
  readonly referralCode?: string | null;
  readonly referralCodeFieldName?: string;
  readonly termsHref?: string | null;
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
export declare const PasswordField: Component<PasswordFieldProps>;
export declare const ProductLinkApproval: Component<ProductLinkApprovalProps>;
export declare const ProviderButton: Component<ProviderButtonProps>;
export declare function validateProductLinkRequest(
  request: ZdpProductLinkRequest,
  trust: ZdpProductLinkTrustPolicy,
  now?: Date
): ZdpProductLinkValidation;
export declare function startPasskeyRegistration(
  options: PublicKeyCredentialCreationOptionsJSON
): Promise<RegistrationResponseJSON>;
export declare function startPasskeyAuthentication(
  options: PublicKeyCredentialRequestOptionsJSON
): Promise<AuthenticationResponseJSON>;
`;

await mkdir(distDir, { recursive: true });
await writeStylesEntry();
await writeDeclarationFiles();
