export const zdpAuthTargetLocales = ['en', 'es', 'zh', 'hi', 'ko', 'fr', 'ja', 'de', 'pt', 'id'] as const;
export const zdpAuthActiveLocales = ['ko', 'en'] as const;
export const zdpAuthPlannedLocales = ['es', 'zh', 'hi', 'fr', 'ja', 'de', 'pt', 'id'] as const;

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
}

export const zdpAuthMessages: Record<ZdpAuthActiveLocale, ZdpAuthMessages> = {
  ko: {
    brand: '8ailors',
    title: {
      login: '로그인',
      signup: '계정 만들기',
      recovery: '계정 복구'
    },
    summary: {
      login: '8ailors 계정으로 계속합니다.',
      signup: '필요한 정보만 받고 바로 시작합니다.',
      recovery: '가입한 이메일로 복구 안내를 보냅니다.'
    },
    fields: {
      email: '이메일',
      password: '비밀번호',
      name: '이름'
    },
    actions: {
      login: '로그인',
      signup: '가입하기',
      recovery: '복구 메일 받기',
      usePasskey: '패스키로 계속하기',
      showPassword: '비밀번호 보기',
      hidePassword: '비밀번호 숨기기'
    },
    providers: {
      groupLabel: '인증 수단 선택',
      passkey: '패스키',
      google: 'Google',
      github: 'GitHub',
      email: '이메일'
    },
    navigation: {
      accountHelp: '계정 도움말'
    },
    links: {
      login: '이미 계정이 있어요',
      signup: '새 계정 만들기',
      recovery: '비밀번호를 잊었어요',
      terms: '이용약관',
      privacy: '개인정보 처리방침'
    },
    status: {
      waiting: '확인 중입니다.',
      error: '입력 내용을 다시 확인하세요.'
    }
  },
  en: {
    brand: '8ailors',
    title: {
      login: 'Sign in',
      signup: 'Create account',
      recovery: 'Recover account'
    },
    summary: {
      login: 'Continue with your 8ailors account.',
      signup: 'Start with only the details we need.',
      recovery: 'We will send recovery instructions to your email.'
    },
    fields: {
      email: 'Email',
      password: 'Password',
      name: 'Name'
    },
    actions: {
      login: 'Sign in',
      signup: 'Create account',
      recovery: 'Send recovery email',
      usePasskey: 'Continue with passkey',
      showPassword: 'Show password',
      hidePassword: 'Hide password'
    },
    providers: {
      groupLabel: 'Choose sign-in method',
      passkey: 'Passkey',
      google: 'Google',
      github: 'GitHub',
      email: 'Email'
    },
    navigation: {
      accountHelp: 'Account help'
    },
    links: {
      login: 'I already have an account',
      signup: 'Create a new account',
      recovery: 'I forgot my password',
      terms: 'Terms',
      privacy: 'Privacy'
    },
    status: {
      waiting: 'Checking now.',
      error: 'Check the details and try again.'
    }
  }
};

export function isActiveAuthLocale(locale: string): locale is ZdpAuthActiveLocale {
  return (zdpAuthActiveLocales as readonly string[]).includes(locale);
}

export function getAuthMessages(locale: ZdpAuthLocale | string): ZdpAuthMessages {
  return isActiveAuthLocale(locale) ? zdpAuthMessages[locale] : zdpAuthMessages.en;
}
