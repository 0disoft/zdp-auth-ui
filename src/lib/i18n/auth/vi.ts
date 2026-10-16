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
    "passkey": "Khóa truy cập (Passkey)",
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
    "title": "Kết nối sản phẩm máy tính",
    "summary": "Xem lại sản phẩm và nội dung mà sản phẩm yêu cầu sử dụng.",
    "fields": {
      "product": "Sản phẩm yêu cầu",
      "account": "Tài khoản",
      "workspace": "Không gian làm việc",
      "expires": "Hạn của yêu cầu"
    },
    "requestedTitle": "Quyền truy cập được yêu cầu",
    "itemKinds": {
      "scope": "Phạm vi",
      "capability": "Khả năng"
    },
    "consentTitle": "Nếu bạn chấp thuận",
    "consentBoundary": "Chấp thuận lần này không đồng bộ dữ liệu sản phẩm.",
    "noWorkspace": "Tài khoản cá nhân",
    "actions": {
      "approve": "Chấp thuận kết nối",
      "deny": "Từ chối"
    },
    "status": {
      "ready": "Bạn có thể chấp thuận hoặc từ chối yêu cầu này.",
      "submitting": "Đang gửi quyết định của bạn.",
      "approved": "Đã chấp thuận kết nối.",
      "denied": "Đã từ chối kết nối.",
      "expired": "Yêu cầu này đã hết hạn. Hãy bắt đầu lại từ sản phẩm máy tính.",
      "consumed": "Yêu cầu này đã được xử lý. Hãy xem trạng thái trong sản phẩm máy tính.",
      "stale": "Thông tin yêu cầu đã cũ. Hãy bắt đầu lại từ sản phẩm máy tính.",
      "invalid": "Không thể tin cậy yêu cầu kết nối này. Hãy bắt đầu lại từ sản phẩm máy tính.",
      "disabled": "Kết nối sản phẩm máy tính chưa khả dụng."
    }
  }
} satisfies ZdpAuthMessages;

export default messages;
