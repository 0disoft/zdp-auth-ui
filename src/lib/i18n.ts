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
    readonly name: string;
    readonly termsAcceptance: string;
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
      signup: '8ailors 계정을 생성합니다.',
      recovery: '가입한 이메일로 복구 안내를 보냅니다.'
    },
    fields: {
      loginId: '아이디',
      email: '이메일',
      password: '비밀번호',
      name: '이름',
      termsAcceptance: '필수 이용약관에 동의합니다.'
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
    },
    availability: {
      preparing: '계정 서비스는 아직 준비 중입니다.'
    },
    productLink: {
      title: '데스크톱 제품 연결',
      summary: '연결할 제품과 허용할 내용을 확인하세요.',
      fields: {
        product: '요청 제품',
        account: '계정',
        workspace: '워크스페이스',
        expires: '요청 만료'
      },
      requestedTitle: '요청한 접근',
      itemKinds: {
        scope: '범위',
        capability: '기능'
      },
      consentTitle: '승인하면',
      consentBoundary: '이 승인만으로 제품 데이터가 동기화되지는 않습니다.',
      noWorkspace: '개인 계정',
      actions: {
        approve: '연결 승인',
        deny: '거부'
      },
      status: {
        ready: '승인하거나 거부할 수 있습니다.',
        submitting: '결정을 보내는 중입니다.',
        approved: '연결을 승인했습니다.',
        denied: '연결을 거부했습니다.',
        expired: '이 요청은 만료되었습니다. 데스크톱 제품에서 새로 요청하세요.',
        consumed: '이미 처리된 요청입니다. 데스크톱 제품에서 상태를 확인하세요.',
        stale: '요청 정보가 오래되었습니다. 데스크톱 제품에서 새로 요청하세요.',
        invalid: '이 연결 요청을 신뢰할 수 없습니다. 데스크톱 제품에서 다시 시작하세요.',
        disabled: '데스크톱 제품 연결은 아직 사용할 수 없습니다.'
      }
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
      loginId: 'Login ID',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      termsAcceptance: 'I agree to the required terms.'
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
    },
    availability: {
      preparing: 'Account access is not available yet.'
    },
    productLink: {
      title: 'Connect desktop product',
      summary: 'Review the product and what it is asking to use.',
      fields: {
        product: 'Requesting product',
        account: 'Account',
        workspace: 'Workspace',
        expires: 'Request expires'
      },
      requestedTitle: 'Requested access',
      itemKinds: {
        scope: 'Scope',
        capability: 'Capability'
      },
      consentTitle: 'If you approve',
      consentBoundary: 'This approval does not sync product data.',
      noWorkspace: 'Personal account',
      actions: {
        approve: 'Approve connection',
        deny: 'Deny'
      },
      status: {
        ready: 'You can approve or deny this request.',
        submitting: 'Sending your decision.',
        approved: 'Connection approved.',
        denied: 'Connection denied.',
        expired: 'This request expired. Start again from the desktop product.',
        consumed: 'This request was already used. Check the desktop product for its status.',
        stale: 'This request is out of date. Start again from the desktop product.',
        invalid: 'This connection request is not trusted. Start again from the desktop product.',
        disabled: 'Desktop product connection is not available yet.'
      }
    }
  }
};

export function isActiveAuthLocale(locale: string): locale is ZdpAuthActiveLocale {
  return (zdpAuthActiveLocales as readonly string[]).includes(locale);
}

export function getAuthMessages(locale: ZdpAuthLocale | string): ZdpAuthMessages {
  return isActiveAuthLocale(locale) ? zdpAuthMessages[locale] : zdpAuthMessages.en;
}
