import ko from './i18n/auth/ko.ts';
import en from './i18n/auth/en.ts';
import zh from './i18n/auth/zh.ts';
import es from './i18n/auth/es.ts';
import fr from './i18n/auth/fr.ts';
import hi from './i18n/auth/hi.ts';
import ja from './i18n/auth/ja.ts';
import vi from './i18n/auth/vi.ts';
import ru from './i18n/auth/ru.ts';
import id from './i18n/auth/id.ts';
import ms from './i18n/auth/ms.ts';
import th from './i18n/auth/th.ts';
import { freezeMessages } from './i18n/freeze-messages.ts';
import { zdpAuthActiveLocales, zdpAuthTargetLocales,
  type ZdpAuthLocale, type ZdpAuthActiveLocale, type ZdpAuthMessages } from './i18n/schema.ts';

export { zdpAuthTargetLocales, zdpAuthActiveLocales, zdpAuthPlannedLocales,
  type ZdpAuthLocale, type ZdpAuthActiveLocale, type ZdpAuthPlannedLocale,
  type ZdpAuthMessages } from './i18n/schema.ts';

export const zdpAuthMessages: Readonly<Record<ZdpAuthLocale, ZdpAuthMessages>> = freezeMessages({
  ko, en, zh, es, fr, hi, ja, vi, ru, id, ms, th
});

export function isActiveAuthLocale(locale: string): locale is ZdpAuthActiveLocale {
  return (zdpAuthActiveLocales as readonly string[]).includes(locale);
}

export function getAuthMessages(locale: ZdpAuthLocale | string): ZdpAuthMessages {
  return isTargetAuthLocale(locale) ? zdpAuthMessages[locale] : zdpAuthMessages.en;
}

function isTargetAuthLocale(locale: string): locale is ZdpAuthLocale {
  return (zdpAuthTargetLocales as readonly string[]).includes(locale);
}
