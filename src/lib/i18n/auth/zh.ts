import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "登录",
    "signup": "创建账户",
    "recovery": "恢复账户"
  },
  "summary": {
    "login": "使用您的 {brand} 账户继续。",
    "signup": "创建您的 {brand} 账户。",
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
    "passkey": "通行密钥",
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
    "title": "连接桌面产品",
    "summary": "请确认要连接的产品及其请求使用的内容。",
    "fields": {
      "product": "发起请求的产品",
      "account": "账户",
      "workspace": "工作区",
      "expires": "请求有效期"
    },
    "requestedTitle": "请求的访问权限",
    "itemKinds": {
      "scope": "范围",
      "capability": "功能"
    },
    "consentTitle": "批准后",
    "consentBoundary": "批准此请求不会同步产品数据。",
    "noWorkspace": "个人账户",
    "actions": {
      "approve": "批准连接",
      "deny": "拒绝"
    },
    "status": {
      "ready": "您可以批准或拒绝此请求。",
      "submitting": "正在发送您的决定。",
      "approved": "已批准连接。",
      "denied": "已拒绝连接。",
      "expired": "此请求已过期。请在桌面产品中重新发起。",
      "consumed": "此请求已被处理。请在桌面产品中查看状态。",
      "stale": "请求信息已过期。请在桌面产品中重新发起。",
      "invalid": "无法信任此连接请求。请在桌面产品中重新开始。",
      "disabled": "桌面产品连接暂不可用。"
    }
  }
} satisfies ZdpAuthMessages;

export default messages;
