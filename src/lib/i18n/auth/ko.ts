import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "로그인",
    "signup": "계정 만들기",
    "recovery": "계정 복구"
  },
  "summary": {
    "login": "{brand} 계정으로 계속합니다.",
    "signup": "{brand} 계정을 생성합니다.",
    "recovery": "가입한 이메일로 복구 안내를 보냅니다."
  },
  "fields": {
    "minimumAgeConfirmation": "저는 최소 {minimumAge}세 이상임을 확인합니다.",
    "loginId": "아이디",
    "email": "이메일",
    "password": "비밀번호",
    "passwordConfirmation": "비밀번호 확인",
    "name": "이름",
    "termsAcceptance": "필수 이용약관에 동의합니다."
  },
  "actions": {
    "login": "로그인",
    "signup": "가입하기",
    "recovery": "복구 메일 받기",
    "usePasskey": "패스키로 계속하기",
    "showPassword": "비밀번호 보기",
    "hidePassword": "비밀번호 숨기기"
  },
  "providers": {
    "groupLabel": "인증 수단 선택",
    "passkey": "패스키",
    "google": "Google",
    "github": "GitHub",
    "email": "이메일"
  },
  "navigation": {
    "accountHelp": "계정 도움말"
  },
  "links": {
    "login": "이미 계정이 있어요",
    "signup": "새 계정 만들기",
    "recovery": "비밀번호를 잊었어요",
    "terms": "이용약관",
    "privacy": "개인정보 처리방침"
  },
  "status": {
    "waiting": "확인 중입니다.",
    "error": "입력 내용을 다시 확인하세요."
  },
  "availability": {
    "preparing": "계정 서비스는 아직 준비 중입니다."
  },
  "feedback": {
    "registered": "회원가입이 완료되었습니다. 로그인해 주세요.",
    "invalidInput": "입력 내용을 확인해 주세요.",
    "expiredPage": "페이지가 만료되었습니다. 새로고침 후 다시 시도해 주세요.",
    "signupUnavailable": "지금은 회원가입을 완료할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    "loginFailed": "아이디 또는 비밀번호를 확인해 주세요.",
    "loginUnavailable": "지금은 로그인할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    "passwordMismatch": "비밀번호가 일치하지 않습니다."
  },
  "productLink": {
    "title": "데스크톱 제품 연결",
    "summary": "연결할 제품과 허용할 내용을 확인하세요.",
    "fields": {
      "product": "요청 제품",
      "account": "계정",
      "workspace": "워크스페이스",
      "expires": "요청 만료"
    },
    "requestedTitle": "요청한 접근",
    "itemKinds": {
      "scope": "범위",
      "capability": "기능"
    },
    "consentTitle": "승인하면",
    "consentBoundary": "이 승인만으로 제품 데이터가 동기화되지는 않습니다.",
    "noWorkspace": "개인 계정",
    "actions": {
      "approve": "연결 승인",
      "deny": "거부"
    },
    "status": {
      "ready": "승인하거나 거부할 수 있습니다.",
      "submitting": "결정을 보내는 중입니다.",
      "approved": "연결을 승인했습니다.",
      "denied": "연결을 거부했습니다.",
      "expired": "이 요청은 만료되었습니다. 데스크톱 제품에서 새로 요청하세요.",
      "consumed": "이미 처리된 요청입니다. 데스크톱 제품에서 상태를 확인하세요.",
      "stale": "요청 정보가 오래되었습니다. 데스크톱 제품에서 새로 요청하세요.",
      "invalid": "이 연결 요청을 신뢰할 수 없습니다. 데스크톱 제품에서 다시 시작하세요.",
      "disabled": "데스크톱 제품 연결은 아직 사용할 수 없습니다."
    }
  }
} satisfies ZdpAuthMessages;

export default messages;
