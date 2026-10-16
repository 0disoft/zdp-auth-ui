import type { ZdpAuthLocale, ZdpAuthMessages, ZdpPasskeySettingsMessages } from './schema.js';

export interface ZdpAuthLocaleCatalog {
  readonly locale: ZdpAuthLocale;
  readonly messages: ZdpAuthMessages;
  readonly passkeySettingsMessages: ZdpPasskeySettingsMessages;
}

const localeLoaders = {
  en: () => import('./en.js'),
  zh: () => import('./zh.js'),
  es: () => import('./es.js'),
  fr: () => import('./fr.js'),
  hi: () => import('./hi.js'),
  ko: () => import('./ko.js'),
  ja: () => import('./ja.js'),
  vi: () => import('./vi.js'),
  ru: () => import('./ru.js'),
  id: () => import('./id.js'),
  ms: () => import('./ms.js'),
  th: () => import('./th.js'),
} satisfies {
  [Locale in ZdpAuthLocale]: () => Promise<ZdpAuthLocaleCatalog & { readonly locale: Locale }>;
};

export async function loadAuthLocale(locale: ZdpAuthLocale | string): Promise<ZdpAuthLocaleCatalog> {
  const selected = typeof locale === 'string' && Object.hasOwn(localeLoaders, locale)
    ? locale as ZdpAuthLocale : 'en';
  return localeLoaders[selected]();
}

export async function loadAuthMessages(locale: ZdpAuthLocale | string): Promise<ZdpAuthMessages> {
  return (await loadAuthLocale(locale)).messages;
}

export async function loadPasskeySettingsMessages(locale: ZdpAuthLocale | string): Promise<ZdpPasskeySettingsMessages> {
  return (await loadAuthLocale(locale)).passkeySettingsMessages;
}
