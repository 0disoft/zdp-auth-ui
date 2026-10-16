import type { ZdpAuthLocale, ZdpAuthMessages, ZdpPasskeySettingsMessages } from './schema.ts';

export interface ZdpAuthLocaleCatalog {
  readonly locale: ZdpAuthLocale;
  readonly messages: ZdpAuthMessages;
  readonly passkeySettingsMessages: ZdpPasskeySettingsMessages;
}

const localeLoaders = {
  en: () => import('./en.ts'),
  zh: () => import('./zh.ts'),
  es: () => import('./es.ts'),
  fr: () => import('./fr.ts'),
  hi: () => import('./hi.ts'),
  ko: () => import('./ko.ts'),
  ja: () => import('./ja.ts'),
  vi: () => import('./vi.ts'),
  ru: () => import('./ru.ts'),
  id: () => import('./id.ts'),
  ms: () => import('./ms.ts'),
  th: () => import('./th.ts')
};

export async function loadAuthLocale(locale: ZdpAuthLocale | string): Promise<ZdpAuthLocaleCatalog> {
  const selected = Object.hasOwn(localeLoaders, locale) ? locale as ZdpAuthLocale : 'en';
  return localeLoaders[selected]();
}

export async function loadAuthMessages(locale: ZdpAuthLocale | string): Promise<ZdpAuthMessages> {
  return (await loadAuthLocale(locale)).messages;
}

export async function loadPasskeySettingsMessages(locale: ZdpAuthLocale | string): Promise<ZdpPasskeySettingsMessages> {
  return (await loadAuthLocale(locale)).passkeySettingsMessages;
}
