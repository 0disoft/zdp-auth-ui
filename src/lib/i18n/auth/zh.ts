import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "登录",
    "signup": "创建账户",
    "recovery": "恢复账户"
  },
  "summary": {
    "login": "使用您的 8ailors 账户继续。",
    "signup": "创建您的 8ailors 账户。",
    "recovery": "我们会将恢复说明发送到您的电子邮箱。"
  },
  "fields": {
    "loginId": "登录 ID",
    "email": "电子邮箱",
    "password": "密码",
    "name": "姓名",
    "termsAcceptance": "我同意必需的使用条款。",
    "passwordConfirmation": "确认密码",
    "minimumAgeConfirmation": "我确认我已年满 {minimumAge} 岁。"
  },
  "actions": {
    "login": "登录",
    "signup": "创建账户",
    "recovery": "获取恢复邮件",
    "usePasskey": "使用通行密钥继续",
    "showPassword": "显示密码",
    "hidePassword": "隐藏密码"
  },
  "providers": {
    "groupLabel": "选择登录方式",
    "passkey": "Passkey",
    "google": "Google",
    "github": "GitHub",
    "email": "电子邮箱"
  },
  "navigation": {
    "accountHelp": "账户帮助"
  },
  "links": {
    "login": "我已有账户",
    "signup": "创建新账户",
    "recovery": "忘记密码",
    "terms": "使用条款",
    "privacy": "隐私政策"
  },
  "status": {
    "waiting": "正在确认。",
    "error": "请检查输入内容后重试。"
  },
  "availability": {
    "preparing": "账户服务尚未开放。"
  },
  "feedback": {
    "registered": "账户已创建。请登录以继续。",
    "invalidInput": "请检查您输入的信息。",
    "expiredPage": "此页面已过期。请刷新后重试。",
    "signupUnavailable": "暂时无法创建账户。请稍后重试。",
    "loginFailed": "请检查您的登录 ID 和密码。",
    "loginUnavailable": "暂时无法登录。请稍后重试。",
    "passwordMismatch": "两次输入的密码不一致。"
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
