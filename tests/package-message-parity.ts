import type { ZdpAuthMessages as PublicMessages } from 'zdp-auth-ui/i18n';
import type { ZdpAuthMessages as SourceMessages } from '../src/lib/i18n';
import type { ZdpAuthLocale, ZdpPasskeySettingsMessages } from '../src/lib/i18n/schema';
import type { loadAuthLocale, loadAuthMessages, loadPasskeySettingsMessages } from 'zdp-auth-ui/i18n/loader';

type LocaleEntries = {
  en: typeof import('zdp-auth-ui/i18n/en');
  zh: typeof import('zdp-auth-ui/i18n/zh');
  es: typeof import('zdp-auth-ui/i18n/es');
  fr: typeof import('zdp-auth-ui/i18n/fr');
  hi: typeof import('zdp-auth-ui/i18n/hi');
  ko: typeof import('zdp-auth-ui/i18n/ko');
  ja: typeof import('zdp-auth-ui/i18n/ja');
  vi: typeof import('zdp-auth-ui/i18n/vi');
  ru: typeof import('zdp-auth-ui/i18n/ru');
  id: typeof import('zdp-auth-ui/i18n/id');
  ms: typeof import('zdp-auth-ui/i18n/ms');
  th: typeof import('zdp-auth-ui/i18n/th');
};

type Same<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;

export type MessageDeclarationParity = Assert<Same<PublicMessages, SourceMessages>>;
export type LocaleDeclarationParity = Assert<Same<
  { [Locale in keyof LocaleEntries]: {
    locale: LocaleEntries[Locale]['locale']; messages: LocaleEntries[Locale]['messages'];
    passkeySettingsMessages: LocaleEntries[Locale]['passkeySettingsMessages']; default: LocaleEntries[Locale]['default'];
  } },
  { [Locale in ZdpAuthLocale]: { locale: Locale; messages: SourceMessages;
    passkeySettingsMessages: ZdpPasskeySettingsMessages; default: SourceMessages } }
>>;
export type LoaderDeclarationParity = Assert<Same<Awaited<ReturnType<typeof loadAuthLocale>>,
  { readonly locale: ZdpAuthLocale; readonly messages: SourceMessages;
    readonly passkeySettingsMessages: ZdpPasskeySettingsMessages }>>;
export type AuthLoaderDeclarationParity = Assert<Same<Awaited<ReturnType<typeof loadAuthMessages>>, SourceMessages>>;
export type SettingsLoaderDeclarationParity = Assert<Same<Awaited<ReturnType<typeof loadPasskeySettingsMessages>>, ZdpPasskeySettingsMessages>>;
