import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "ログイン",
    "signup": "アカウントを作成",
    "recovery": "アカウントを復旧"
  },
  "summary": {
    "login": "8ailors アカウントで続行します。",
    "signup": "8ailors アカウントを作成します。",
    "recovery": "復旧手順をメールでお送りします。"
  },
  "fields": {
    "loginId": "ログイン ID",
    "email": "メールアドレス",
    "password": "パスワード",
    "name": "名前",
    "termsAcceptance": "必須の利用規約に同意します。",
    "passwordConfirmation": "パスワード確認",
    "minimumAgeConfirmation": "私は{minimumAge}歳以上であることを確認します。"
  },
  "actions": {
    "login": "ログイン",
    "signup": "アカウントを作成",
    "recovery": "復旧メールを受け取る",
    "usePasskey": "パスキーで続行",
    "showPassword": "パスワードを表示",
    "hidePassword": "パスワードを隠す"
  },
  "providers": {
    "groupLabel": "ログイン方法を選択",
    "passkey": "パスキー",
    "google": "Google",
    "github": "GitHub",
    "email": "メールアドレス"
  },
  "navigation": {
    "accountHelp": "アカウントのヘルプ"
  },
  "links": {
    "login": "アカウントをお持ちの方",
    "signup": "新しいアカウントを作成",
    "recovery": "パスワードを忘れた方",
    "terms": "利用規約",
    "privacy": "プライバシー"
  },
  "status": {
    "waiting": "確認中です。",
    "error": "入力内容を確認して、もう一度お試しください。"
  },
  "availability": {
    "preparing": "アカウントサービスはまだ利用できません。"
  },
  "feedback": {
    "registered": "アカウントを作成しました。ログインしてください。",
    "invalidInput": "入力内容を確認してください。",
    "expiredPage": "ページの有効期限が切れました。更新してもう一度お試しください。",
    "signupUnavailable": "現在アカウントを作成できません。しばらくしてからお試しください。",
    "loginFailed": "ログイン ID またはパスワードを確認してください。",
    "loginUnavailable": "現在ログインできません。しばらくしてからお試しください。",
    "passwordMismatch": "パスワードが一致しません。"
  },
  "productLink": {
    "title": "デスクトップ製品を接続",
    "summary": "接続する製品と、許可を求めている内容を確認してください。",
    "fields": {
      "product": "要求元の製品",
      "account": "アカウント",
      "workspace": "ワークスペース",
      "expires": "要求の有効期限"
    },
    "requestedTitle": "要求されたアクセス",
    "itemKinds": {
      "scope": "範囲",
      "capability": "機能"
    },
    "consentTitle": "承認すると",
    "consentBoundary": "この承認では製品データは同期されません。",
    "noWorkspace": "個人アカウント",
    "actions": {
      "approve": "接続を承認",
      "deny": "拒否"
    },
    "status": {
      "ready": "この要求を承認または拒否できます。",
      "submitting": "決定を送信しています。",
      "approved": "接続を承認しました。",
      "denied": "接続を拒否しました。",
      "expired": "この要求は期限切れです。デスクトップ製品からやり直してください。",
      "consumed": "この要求はすでに処理済みです。デスクトップ製品で状態を確認してください。",
      "stale": "要求の情報が古くなっています。デスクトップ製品からやり直してください。",
      "invalid": "この接続要求は信頼できません。デスクトップ製品からやり直してください。",
      "disabled": "デスクトップ製品の接続はまだ利用できません。"
    }
  }
} satisfies ZdpAuthMessages;

export default messages;
