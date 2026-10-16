import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "Đăng nhập",
    "signup": "Tạo tài khoản",
    "recovery": "Khôi phục tài khoản"
  },
  "summary": {
    "login": "Tiếp tục bằng tài khoản 8ailors của bạn.",
    "signup": "Tạo tài khoản 8ailors của bạn.",
    "recovery": "Chúng tôi sẽ gửi hướng dẫn khôi phục đến email của bạn."
  },
  "fields": {
    "loginId": "ID đăng nhập",
    "email": "Email",
    "password": "Mật khẩu",
    "name": "Tên",
    "termsAcceptance": "Tôi đồng ý với các điều khoản bắt buộc.",
    "passwordConfirmation": "Xác nhận mật khẩu",
    "minimumAgeConfirmation": "Tôi xác nhận mình đã đủ {minimumAge} tuổi."
  },
  "actions": {
    "login": "Đăng nhập",
    "signup": "Tạo tài khoản",
    "recovery": "Nhận email khôi phục",
    "usePasskey": "Tiếp tục bằng passkey",
    "showPassword": "Hiện mật khẩu",
    "hidePassword": "Ẩn mật khẩu"
  },
  "providers": {
    "groupLabel": "Chọn cách đăng nhập",
    "passkey": "Passkey",
    "google": "Google",
    "github": "GitHub",
    "email": "Email"
  },
  "navigation": {
    "accountHelp": "Trợ giúp tài khoản"
  },
  "links": {
    "login": "Tôi đã có tài khoản",
    "signup": "Tạo tài khoản mới",
    "recovery": "Tôi quên mật khẩu",
    "terms": "Điều khoản",
    "privacy": "Quyền riêng tư"
  },
  "status": {
    "waiting": "Đang kiểm tra.",
    "error": "Hãy kiểm tra thông tin rồi thử lại."
  },
  "availability": {
    "preparing": "Dịch vụ tài khoản chưa khả dụng."
  },
  "feedback": {
    "registered": "Đã tạo tài khoản. Hãy đăng nhập để tiếp tục.",
    "invalidInput": "Hãy kiểm tra thông tin đã nhập.",
    "expiredPage": "Trang này đã hết hạn. Hãy tải lại rồi thử lại.",
    "signupUnavailable": "Tạm thời không thể tạo tài khoản. Hãy thử lại sau.",
    "loginFailed": "Hãy kiểm tra ID đăng nhập và mật khẩu.",
    "loginUnavailable": "Tạm thời không thể đăng nhập. Hãy thử lại sau.",
    "passwordMismatch": "Mật khẩu không khớp."
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
