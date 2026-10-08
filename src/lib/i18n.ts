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
    readonly passwordConfirmation: string;
    readonly name: string;
    readonly termsAcceptance: string;
    readonly minimumAgeConfirmation: string;
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
  readonly feedback: {
    readonly registered: string;
    readonly invalidInput: string;
    readonly expiredPage: string;
    readonly signupUnavailable: string;
    readonly loginFailed: string;
    readonly loginUnavailable: string;
    readonly passwordMismatch: string;
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

const fallbackProductLinkMessages: ZdpAuthMessages['productLink'] = {
  title: 'Connect desktop product',
  summary: 'Review the product and what it is asking to use.',
  fields: {
    product: 'Requesting product', account: 'Account', workspace: 'Workspace', expires: 'Request expires'
  },
  requestedTitle: 'Requested access',
  itemKinds: { scope: 'Scope', capability: 'Capability' },
  consentTitle: 'If you approve',
  consentBoundary: 'This approval does not sync product data.',
  noWorkspace: 'Personal account',
  actions: { approve: 'Approve connection', deny: 'Deny' },
  status: {
    ready: 'You can approve or deny this request.',
    submitting: 'Sending your decision.', approved: 'Connection approved.', denied: 'Connection denied.',
    expired: 'This request expired. Start again from the desktop product.',
    consumed: 'This request was already used. Check the desktop product for its status.',
    stale: 'This request is out of date. Start again from the desktop product.',
    invalid: 'This connection request is not trusted. Start again from the desktop product.',
    disabled: 'Desktop product connection is not available yet.'
  }
};

export const zdpAuthMessages: Record<ZdpAuthLocale, ZdpAuthMessages> = {
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
      minimumAgeConfirmation: "저는 최소 {minimumAge}세 이상임을 확인합니다.",
      loginId: '아이디',
      email: '이메일',
      password: '비밀번호',
      passwordConfirmation: '비밀번호 확인',
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
    feedback: {
      registered: '회원가입이 완료되었습니다. 로그인해 주세요.',
      invalidInput: '입력 내용을 확인해 주세요.',
      expiredPage: '페이지가 만료되었습니다. 새로고침 후 다시 시도해 주세요.',
      signupUnavailable: '지금은 회원가입을 완료할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      loginFailed: '아이디 또는 비밀번호를 확인해 주세요.',
      loginUnavailable: '지금은 로그인할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      passwordMismatch: '비밀번호가 일치하지 않습니다.'
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
      minimumAgeConfirmation: "I confirm I am at least {minimumAge} years old.",
      loginId: 'Login ID',
      email: 'Email',
      password: 'Password',
      passwordConfirmation: 'Confirm password',
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
    feedback: {
      registered: 'Account created. Sign in to continue.',
      invalidInput: 'Check the information you entered.',
      expiredPage: 'This page expired. Refresh and try again.',
      signupUnavailable: 'Account creation is temporarily unavailable. Try again shortly.',
      loginFailed: 'Check your login ID and password.',
      loginUnavailable: 'Sign in is temporarily unavailable. Try again shortly.',
      passwordMismatch: 'Passwords do not match.'
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
  },
  zh: localizedAuthMessages({
    minimumAgeConfirmation: "我确认我已年满 {minimumAge} 岁。",
    title: ['登录', '创建账户', '恢复账户'],
    summary: ['使用您的 8ailors 账户继续。', '创建您的 8ailors 账户。', '我们会将恢复说明发送到您的电子邮箱。'],
    fields: ['登录 ID', '电子邮箱', '密码', '姓名', '我同意必需的使用条款。', '确认密码'],
    actions: ['登录', '创建账户', '获取恢复邮件', '使用通行密钥继续', '显示密码', '隐藏密码'],
    groupLabel: '选择登录方式', accountHelp: '账户帮助',
    links: ['我已有账户', '创建新账户', '忘记密码', '使用条款', '隐私政策'],
    status: ['正在确认。', '请检查输入内容后重试。'], preparing: '账户服务尚未开放。',
    feedback: ['账户已创建。请登录以继续。', '请检查您输入的信息。', '此页面已过期。请刷新后重试。', '暂时无法创建账户。请稍后重试。', '请检查您的登录 ID 和密码。', '暂时无法登录。请稍后重试。', '两次输入的密码不一致。']
  }),
  es: localizedAuthMessages({
    minimumAgeConfirmation: "Confirmo que tengo al menos {minimumAge} años.",
    title: ['Iniciar sesión', 'Crear cuenta', 'Recuperar cuenta'],
    summary: ['Continúa con tu cuenta de 8ailors.', 'Crea tu cuenta de 8ailors.', 'Enviaremos las instrucciones de recuperación a tu correo electrónico.'],
    fields: ['ID de acceso', 'Correo electrónico', 'Contraseña', 'Nombre', 'Acepto los términos obligatorios.', 'Confirmar contraseña'],
    actions: ['Iniciar sesión', 'Crear cuenta', 'Recibir correo de recuperación', 'Continuar con clave de acceso', 'Mostrar contraseña', 'Ocultar contraseña'],
    groupLabel: 'Elige cómo iniciar sesión', accountHelp: 'Ayuda de la cuenta',
    links: ['Ya tengo una cuenta', 'Crear una cuenta nueva', 'Olvidé mi contraseña', 'Términos', 'Privacidad'],
    status: ['Comprobando.', 'Revisa los datos e inténtalo de nuevo.'], preparing: 'El servicio de cuentas aún no está disponible.',
    feedback: ['Cuenta creada. Inicia sesión para continuar.', 'Revisa la información introducida.', 'La página ha caducado. Actualízala e inténtalo de nuevo.', 'No se puede crear la cuenta temporalmente. Inténtalo más tarde.', 'Revisa tu ID de acceso y contraseña.', 'No se puede iniciar sesión temporalmente. Inténtalo más tarde.', 'Las contraseñas no coinciden.']
  }),
  fr: localizedAuthMessages({
    minimumAgeConfirmation: "Je confirme avoir au moins {minimumAge} ans.",
    title: ['Se connecter', 'Créer un compte', 'Récupérer le compte'],
    summary: ['Continuez avec votre compte 8ailors.', 'Créez votre compte 8ailors.', 'Nous enverrons les instructions de récupération à votre adresse e-mail.'],
    fields: ['Identifiant', 'Adresse e-mail', 'Mot de passe', 'Nom', "J’accepte les conditions obligatoires.", 'Confirmer le mot de passe'],
    actions: ['Se connecter', 'Créer un compte', 'Recevoir l’e-mail de récupération', 'Continuer avec une clé d’accès', 'Afficher le mot de passe', 'Masquer le mot de passe'],
    groupLabel: 'Choisissez une méthode de connexion', accountHelp: 'Aide du compte',
    links: ["J’ai déjà un compte", 'Créer un nouveau compte', 'Mot de passe oublié', 'Conditions', 'Confidentialité'],
    status: ['Vérification en cours.', 'Vérifiez les informations et réessayez.'], preparing: "Le service de comptes n’est pas encore disponible.",
    feedback: ['Compte créé. Connectez-vous pour continuer.', 'Vérifiez les informations saisies.', 'Cette page a expiré. Actualisez-la et réessayez.', 'La création de compte est temporairement indisponible. Réessayez plus tard.', 'Vérifiez votre identifiant et votre mot de passe.', 'La connexion est temporairement indisponible. Réessayez plus tard.', 'Les mots de passe ne correspondent pas.']
  }),
  hi: localizedAuthMessages({
    minimumAgeConfirmation: "मैं पुष्टि करता/करती हूँ कि मेरी आयु कम से कम {minimumAge} वर्ष है।",
    title: ['साइन इन करें', 'खाता बनाएँ', 'खाता पुनर्प्राप्त करें'],
    summary: ['अपने 8ailors खाते से आगे बढ़ें।', 'अपना 8ailors खाता बनाएँ।', 'हम पुनर्प्राप्ति निर्देश आपके ईमेल पर भेजेंगे।'],
    fields: ['लॉगिन आईडी', 'ईमेल', 'पासवर्ड', 'नाम', 'मैं आवश्यक शर्तों से सहमत हूँ।', 'पासवर्ड की पुष्टि करें'],
    actions: ['साइन इन करें', 'खाता बनाएँ', 'पुनर्प्राप्ति ईमेल पाएँ', 'पासकी से आगे बढ़ें', 'पासवर्ड दिखाएँ', 'पासवर्ड छिपाएँ'],
    groupLabel: 'साइन इन करने का तरीका चुनें', accountHelp: 'खाता सहायता',
    links: ['मेरा पहले से खाता है', 'नया खाता बनाएँ', 'मैं पासवर्ड भूल गया', 'शर्तें', 'गोपनीयता'],
    status: ['जाँच की जा रही है।', 'जानकारी जाँचें और फिर प्रयास करें।'], preparing: 'खाता सेवा अभी उपलब्ध नहीं है।',
    feedback: ['खाता बन गया। आगे बढ़ने के लिए साइन इन करें।', 'दर्ज की गई जानकारी जाँचें।', 'यह पेज समाप्त हो गया है। रीफ़्रेश करके फिर प्रयास करें।', 'अभी खाता नहीं बनाया जा सकता। थोड़ी देर बाद प्रयास करें।', 'अपनी लॉगिन आईडी और पासवर्ड जाँचें।', 'अभी साइन इन नहीं किया जा सकता। थोड़ी देर बाद प्रयास करें।', 'पासवर्ड मेल नहीं खा रहे हैं।']
  }),
  ja: localizedAuthMessages({
    minimumAgeConfirmation: "私は{minimumAge}歳以上であることを確認します。",
    title: ['ログイン', 'アカウントを作成', 'アカウントを復旧'],
    summary: ['8ailors アカウントで続行します。', '8ailors アカウントを作成します。', '復旧手順をメールでお送りします。'],
    fields: ['ログイン ID', 'メールアドレス', 'パスワード', '名前', '必須の利用規約に同意します。', 'パスワード確認'],
    actions: ['ログイン', 'アカウントを作成', '復旧メールを受け取る', 'パスキーで続行', 'パスワードを表示', 'パスワードを隠す'],
    groupLabel: 'ログイン方法を選択', accountHelp: 'アカウントのヘルプ',
    links: ['アカウントをお持ちの方', '新しいアカウントを作成', 'パスワードを忘れた方', '利用規約', 'プライバシー'],
    status: ['確認中です。', '入力内容を確認して、もう一度お試しください。'], preparing: 'アカウントサービスはまだ利用できません。',
    feedback: ['アカウントを作成しました。ログインしてください。', '入力内容を確認してください。', 'ページの有効期限が切れました。更新してもう一度お試しください。', '現在アカウントを作成できません。しばらくしてからお試しください。', 'ログイン ID またはパスワードを確認してください。', '現在ログインできません。しばらくしてからお試しください。', 'パスワードが一致しません。']
  }),
  vi: localizedAuthMessages({
    minimumAgeConfirmation: "Tôi xác nhận mình đã đủ {minimumAge} tuổi.",
    title: ['Đăng nhập', 'Tạo tài khoản', 'Khôi phục tài khoản'],
    summary: ['Tiếp tục bằng tài khoản 8ailors của bạn.', 'Tạo tài khoản 8ailors của bạn.', 'Chúng tôi sẽ gửi hướng dẫn khôi phục đến email của bạn.'],
    fields: ['ID đăng nhập', 'Email', 'Mật khẩu', 'Tên', 'Tôi đồng ý với các điều khoản bắt buộc.', 'Xác nhận mật khẩu'],
    actions: ['Đăng nhập', 'Tạo tài khoản', 'Nhận email khôi phục', 'Tiếp tục bằng passkey', 'Hiện mật khẩu', 'Ẩn mật khẩu'],
    groupLabel: 'Chọn cách đăng nhập', accountHelp: 'Trợ giúp tài khoản',
    links: ['Tôi đã có tài khoản', 'Tạo tài khoản mới', 'Tôi quên mật khẩu', 'Điều khoản', 'Quyền riêng tư'],
    status: ['Đang kiểm tra.', 'Hãy kiểm tra thông tin rồi thử lại.'], preparing: 'Dịch vụ tài khoản chưa khả dụng.',
    feedback: ['Đã tạo tài khoản. Hãy đăng nhập để tiếp tục.', 'Hãy kiểm tra thông tin đã nhập.', 'Trang này đã hết hạn. Hãy tải lại rồi thử lại.', 'Tạm thời không thể tạo tài khoản. Hãy thử lại sau.', 'Hãy kiểm tra ID đăng nhập và mật khẩu.', 'Tạm thời không thể đăng nhập. Hãy thử lại sau.', 'Mật khẩu không khớp.']
  }),
  ru: localizedAuthMessages({
    minimumAgeConfirmation: "Я подтверждаю, что мне не менее {minimumAge} лет.",
    title: ['Войти', 'Создать аккаунт', 'Восстановить аккаунт'],
    summary: ['Продолжите с аккаунтом 8ailors.', 'Создайте аккаунт 8ailors.', 'Мы отправим инструкции по восстановлению на вашу электронную почту.'],
    fields: ['Логин', 'Электронная почта', 'Пароль', 'Имя', 'Я принимаю обязательные условия.', 'Подтверждение пароля'],
    actions: ['Войти', 'Создать аккаунт', 'Получить письмо для восстановления', 'Продолжить с ключом доступа', 'Показать пароль', 'Скрыть пароль'],
    groupLabel: 'Выберите способ входа', accountHelp: 'Помощь с аккаунтом',
    links: ['У меня уже есть аккаунт', 'Создать новый аккаунт', 'Я забыл пароль', 'Условия', 'Конфиденциальность'],
    status: ['Проверяем.', 'Проверьте данные и повторите попытку.'], preparing: 'Сервис аккаунтов пока недоступен.',
    feedback: ['Аккаунт создан. Войдите, чтобы продолжить.', 'Проверьте введённые данные.', 'Срок действия страницы истёк. Обновите её и повторите попытку.', 'Создание аккаунта временно недоступно. Повторите попытку позже.', 'Проверьте логин и пароль.', 'Вход временно недоступен. Повторите попытку позже.', 'Пароли не совпадают.']
  }),
  id: localizedAuthMessages({
    minimumAgeConfirmation: "Saya mengonfirmasi bahwa saya berusia minimal {minimumAge} tahun.",
    title: ['Masuk', 'Buat akun', 'Pulihkan akun'],
    summary: ['Lanjutkan dengan akun 8ailors Anda.', 'Buat akun 8ailors Anda.', 'Kami akan mengirim petunjuk pemulihan ke email Anda.'],
    fields: ['ID masuk', 'Email', 'Kata sandi', 'Nama', 'Saya menyetujui ketentuan wajib.', 'Konfirmasi kata sandi'],
    actions: ['Masuk', 'Buat akun', 'Terima email pemulihan', 'Lanjutkan dengan passkey', 'Tampilkan kata sandi', 'Sembunyikan kata sandi'],
    groupLabel: 'Pilih cara masuk', accountHelp: 'Bantuan akun',
    links: ['Saya sudah memiliki akun', 'Buat akun baru', 'Saya lupa kata sandi', 'Ketentuan', 'Privasi'],
    status: ['Sedang memeriksa.', 'Periksa informasi lalu coba lagi.'], preparing: 'Layanan akun belum tersedia.',
    feedback: ['Akun berhasil dibuat. Masuk untuk melanjutkan.', 'Periksa informasi yang Anda masukkan.', 'Halaman ini telah kedaluwarsa. Muat ulang lalu coba lagi.', 'Pembuatan akun sementara tidak tersedia. Coba lagi nanti.', 'Periksa ID masuk dan kata sandi Anda.', 'Proses masuk sementara tidak tersedia. Coba lagi nanti.', 'Kata sandi tidak cocok.']
  }),
  ms: localizedAuthMessages({
    minimumAgeConfirmation: "Saya mengesahkan bahawa saya berumur sekurang-kurangnya {minimumAge} tahun.",
    title: ['Log masuk', 'Cipta akaun', 'Pulihkan akaun'],
    summary: ['Teruskan dengan akaun 8ailors anda.', 'Cipta akaun 8ailors anda.', 'Kami akan menghantar arahan pemulihan ke e-mel anda.'],
    fields: ['ID log masuk', 'E-mel', 'Kata laluan', 'Nama', 'Saya bersetuju dengan terma wajib.', 'Pengesahan kata laluan'],
    actions: ['Log masuk', 'Cipta akaun', 'Terima e-mel pemulihan', 'Teruskan dengan kunci laluan', 'Tunjukkan kata laluan', 'Sembunyikan kata laluan'],
    groupLabel: 'Pilih cara log masuk', accountHelp: 'Bantuan akaun',
    links: ['Saya sudah mempunyai akaun', 'Cipta akaun baharu', 'Saya terlupa kata laluan', 'Terma', 'Privasi'],
    status: ['Sedang menyemak.', 'Semak maklumat dan cuba lagi.'], preparing: 'Perkhidmatan akaun belum tersedia.',
    feedback: ['Akaun berjaya dicipta. Log masuk untuk meneruskan.', 'Semak maklumat yang anda masukkan.', 'Halaman ini telah tamat tempoh. Muat semula dan cuba lagi.', 'Penciptaan akaun tidak tersedia buat sementara waktu. Cuba lagi kemudian.', 'Semak ID log masuk dan kata laluan anda.', 'Log masuk tidak tersedia buat sementara waktu. Cuba lagi kemudian.', 'Kata laluan tidak sepadan.']
  }),
  th: localizedAuthMessages({
    minimumAgeConfirmation: "ฉันยืนยันว่าฉันมีอายุอย่างน้อย {minimumAge} ปี",
    title: ['เข้าสู่ระบบ', 'สร้างบัญชี', 'กู้คืนบัญชี'],
    summary: ['ดำเนินการต่อด้วยบัญชี 8ailors ของคุณ', 'สร้างบัญชี 8ailors ของคุณ', 'เราจะส่งคำแนะนำการกู้คืนไปยังอีเมลของคุณ'],
    fields: ['รหัสเข้าสู่ระบบ', 'อีเมล', 'รหัสผ่าน', 'ชื่อ', 'ฉันยอมรับข้อกำหนดที่จำเป็น', 'ยืนยันรหัสผ่าน'],
    actions: ['เข้าสู่ระบบ', 'สร้างบัญชี', 'รับอีเมลกู้คืน', 'ดำเนินการต่อด้วยพาสคีย์', 'แสดงรหัสผ่าน', 'ซ่อนรหัสผ่าน'],
    groupLabel: 'เลือกวิธีเข้าสู่ระบบ', accountHelp: 'ความช่วยเหลือเกี่ยวกับบัญชี',
    links: ['ฉันมีบัญชีแล้ว', 'สร้างบัญชีใหม่', 'ฉันลืมรหัสผ่าน', 'ข้อกำหนด', 'ความเป็นส่วนตัว'],
    status: ['กำลังตรวจสอบ', 'โปรดตรวจสอบข้อมูลแล้วลองอีกครั้ง'], preparing: 'บริการบัญชียังไม่พร้อมใช้งาน',
    feedback: ['สร้างบัญชีแล้ว โปรดเข้าสู่ระบบเพื่อดำเนินการต่อ', 'โปรดตรวจสอบข้อมูลที่กรอก', 'หน้านี้หมดอายุแล้ว โปรดรีเฟรชและลองอีกครั้ง', 'ไม่สามารถสร้างบัญชีได้ชั่วคราว โปรดลองอีกครั้งภายหลัง', 'โปรดตรวจสอบรหัสเข้าสู่ระบบและรหัสผ่าน', 'ไม่สามารถเข้าสู่ระบบได้ชั่วคราว โปรดลองอีกครั้งภายหลัง', 'รหัสผ่านไม่ตรงกัน']
  })
};

interface LocalizedAuthCopy {
  readonly minimumAgeConfirmation: string;
  readonly title: readonly [string, string, string];
  readonly summary: readonly [string, string, string];
  readonly fields: readonly [string, string, string, string, string, string];
  readonly actions: readonly [string, string, string, string, string, string];
  readonly groupLabel: string;
  readonly accountHelp: string;
  readonly links: readonly [string, string, string, string, string];
  readonly status: readonly [string, string];
  readonly preparing: string;
  readonly feedback: readonly [string, string, string, string, string, string, string];
}

function localizedAuthMessages(copy: LocalizedAuthCopy): ZdpAuthMessages {
  return {
    brand: '8ailors',
    title: { login: copy.title[0], signup: copy.title[1], recovery: copy.title[2] },
    summary: { login: copy.summary[0], signup: copy.summary[1], recovery: copy.summary[2] },
    fields: {
      loginId: copy.fields[0], email: copy.fields[1], password: copy.fields[2],
      name: copy.fields[3], termsAcceptance: copy.fields[4],
      passwordConfirmation: copy.fields[5],
      minimumAgeConfirmation: copy.minimumAgeConfirmation
    },
    actions: {
      login: copy.actions[0], signup: copy.actions[1], recovery: copy.actions[2],
      usePasskey: copy.actions[3], showPassword: copy.actions[4], hidePassword: copy.actions[5]
    },
    providers: {
      groupLabel: copy.groupLabel, passkey: 'Passkey', google: 'Google', github: 'GitHub', email: copy.fields[1]
    },
    navigation: { accountHelp: copy.accountHelp },
    links: {
      login: copy.links[0], signup: copy.links[1], recovery: copy.links[2],
      terms: copy.links[3], privacy: copy.links[4]
    },
    status: { waiting: copy.status[0], error: copy.status[1] },
    availability: { preparing: copy.preparing },
    feedback: {
      registered: copy.feedback[0], invalidInput: copy.feedback[1], expiredPage: copy.feedback[2],
      signupUnavailable: copy.feedback[3], loginFailed: copy.feedback[4], loginUnavailable: copy.feedback[5],
      passwordMismatch: copy.feedback[6]
    },
    productLink: fallbackProductLinkMessages
  };
}

export function isActiveAuthLocale(locale: string): locale is ZdpAuthActiveLocale {
  return (zdpAuthActiveLocales as readonly string[]).includes(locale);
}

export function getAuthMessages(locale: ZdpAuthLocale | string): ZdpAuthMessages {
  return isTargetAuthLocale(locale) ? zdpAuthMessages[locale] : zdpAuthMessages.en;
}

function isTargetAuthLocale(locale: string): locale is ZdpAuthLocale {
  return (zdpAuthTargetLocales as readonly string[]).includes(locale);
}
