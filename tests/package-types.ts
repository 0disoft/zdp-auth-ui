import {
  zdpAuthActiveLocales,
  zdpAuthMessages,
  zdpAuthTargetLocales,
  type ZdpAuthActiveLocale
} from 'zdp-auth-ui/i18n';

const japaneseTitle: string = zdpAuthMessages.ja.title.login;
const signupTitles: string[] = zdpAuthTargetLocales.map((locale) => zdpAuthMessages[locale].title.signup);
const activeLocale: ZdpAuthActiveLocale = zdpAuthActiveLocales[0];

void [japaneseTitle, signupTitles, activeLocale];
