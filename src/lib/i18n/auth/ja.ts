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
    "passkey": "Passkey",
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
    "title": "Connect desktop product",
    "summary": "Review the product and what it is asking to use.",
    "fields": {
      "product": "Requesting product",
      "account": "Account",
      "workspace": "Workspace",
      "expires": "Request expires"
    },
    "requestedTitle": "Requested access",
    "itemKinds": {
      "scope": "Scope",
      "capability": "Capability"
    },
    "consentTitle": "If you approve",
    "consentBoundary": "This approval does not sync product data.",
    "noWorkspace": "Personal account",
    "actions": {
      "approve": "Approve connection",
      "deny": "Deny"
    },
    "status": {
      "ready": "You can approve or deny this request.",
      "submitting": "Sending your decision.",
      "approved": "Connection approved.",
      "denied": "Connection denied.",
      "expired": "This request expired. Start again from the desktop product.",
      "consumed": "This request was already used. Check the desktop product for its status.",
      "stale": "This request is out of date. Start again from the desktop product.",
      "invalid": "This connection request is not trusted. Start again from the desktop product.",
      "disabled": "Desktop product connection is not available yet."
    }
  }
} satisfies ZdpAuthMessages;

export default messages;
