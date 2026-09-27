import {
  zdpAuthActiveLocales,
  zdpAuthMessages,
  zdpAuthTargetLocales,
  type ZdpAuthActiveLocale
} from 'zdp-auth-ui/i18n';
import type { AuthShellProps } from 'zdp-auth-ui';

const japaneseTitle: string = zdpAuthMessages.ja.title.login;
const signupTitles: string[] = zdpAuthTargetLocales.map((locale) => zdpAuthMessages[locale].title.signup);
const activeLocale: ZdpAuthActiveLocale = zdpAuthActiveLocales[0];
const busyShellProps: AuthShellProps = { busy: true };

void [japaneseTitle, signupTitles, activeLocale, busyShellProps];
