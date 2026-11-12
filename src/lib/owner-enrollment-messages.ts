const en = {
  title: 'Doubloon owner access', intro: 'Verify two different emails and two different phone numbers, then bind an existing passkey. These recovery contacts do not change your login contacts.',
  unavailable: 'Owner enrollment is not available for this account.', preview: 'Local preview · synthetic account and codes only. No email or SMS is sent.',
  email_a: 'Recovery email 1', email_b: 'Recovery email 2', phone_a: 'Recovery phone 1', phone_b: 'Recovery phone 2',
  contact: 'Recovery contact', phoneHelp: 'Use international format, for example +821012345678.', password: 'Current account password',
  consent: 'I agree to receive this recovery verification code by SMS.', request: 'Send verification code', retry: 'Try sending again',
  code: '6-digit verification code', confirm: 'Verify code', not_set: 'Not set', pending: 'Awaiting verification', verified: 'Verified',
  unknown: 'Delivery could not be confirmed. Refresh status before continuing. Do not request another code.',
  rejected: 'Delivery was rejected. You can explicitly try again after the delivery limit resets.',
  accepted: 'Delivery accepted. Enter the code you receive.', refresh: 'Refresh status', passkey: 'Owner passkey',
  prerequisite: 'Verify all four distinct recovery contacts before binding a passkey.', security: 'Register or manage passkeys in Security',
  choose: 'Choose an existing passkey', bind: 'Bind this passkey', bound: 'Owner passkey bound', none: 'No existing passkey is available. Register one in Security, then return and refresh.',
  limits: 'New email addresses: one per owner every 60 seconds, up to 5 in 24 hours. Email code delivery has separate per-recipient daily and shared limits. Default SMS limit: once per 60 seconds, up to 3 per recipient per day.',
  scope: 'This prepares owner access only. Wallet key generation, signing and publication remain disabled.',
  saved: 'Status updated.', failed: 'The request was rejected. Check your details and try again.',
  unconfirmed: 'The outcome is unknown. Refresh status before continuing; a code will not be resent automatically.',
  rate_limited: 'The sending limit was reached. Wait before trying again.', expired: 'Your session or verification has expired. Refresh status or sign in again.',
  wait: 'Please wait…', retryAfter: 'Retry after (seconds):'
};
export type OwnerEnrollmentMessages = typeof en;
const ko: OwnerEnrollmentMessages = {
  title: '두블룬 소유자 접근 설정', intro: '서로 다른 이메일 2개와 전화번호 2개를 인증한 뒤 기존 패스키를 연결하세요. 복구 연락처는 로그인 연락처를 바꾸지 않습니다.',
  unavailable: '이 계정에서는 소유자 접근 설정을 사용할 수 없습니다.', preview: '로컬 미리보기 · 가상 계정과 인증번호만 사용합니다. 이메일이나 SMS를 발송하지 않습니다.',
  email_a: '복구 이메일 1', email_b: '복구 이메일 2', phone_a: '복구 전화번호 1', phone_b: '복구 전화번호 2',
  contact: '복구 연락처', phoneHelp: '국가번호를 포함해 입력하세요. 예: +821012345678', password: '현재 계정 비밀번호',
  consent: '복구 인증번호를 SMS로 받는 데 동의합니다.', request: '인증번호 보내기', retry: '다시 발송하기',
  code: '숫자 6자리 인증번호', confirm: '인증번호 확인', not_set: '미등록', pending: '인증 대기', verified: '인증 완료',
  unknown: '발송 결과를 확인하지 못했습니다. 추가 발송 없이 상태를 새로 확인하세요.',
  rejected: '발송이 거절됐습니다. 발송 제한이 풀리면 직접 다시 시도할 수 있습니다.', accepted: '발송 요청이 접수됐습니다. 받은 인증번호를 입력하세요.',
  refresh: '상태 새로 확인', passkey: '소유자 패스키', prerequisite: '서로 다른 복구 연락처 4개를 모두 인증하면 패스키를 연결할 수 있습니다.',
  security: '보안 설정에서 패스키 등록·관리', choose: '기존 패스키 선택', bind: '이 패스키 연결', bound: '소유자 패스키 연결 완료',
  none: '사용할 수 있는 기존 패스키가 없습니다. 보안 설정에서 등록한 뒤 돌아와 상태를 새로 확인하세요.',
  limits: '새 이메일 등록은 소유자 기준 60초 간격, 최근 24시간 동안 5개까지 가능합니다. 코드 발송에는 수신 주소별 하루 한도와 전체 발송 한도가 따로 적용됩니다. SMS 기본 한도는 수신 번호별 60초 간격, 하루 3회입니다.',
  scope: '소유자 접근 준비만 진행합니다. 지갑 키 생성·서명·발행은 비활성 상태입니다.',
  saved: '상태를 확인했습니다.', failed: '요청이 거절됐습니다. 입력 내용을 확인하고 다시 시도하세요.',
  unconfirmed: '처리 결과를 확인하지 못했습니다. 상태를 새로 확인하세요. 인증번호는 자동으로 다시 보내지 않습니다.',
  rate_limited: '발송 한도에 도달했습니다. 잠시 기다린 뒤 다시 시도하세요.', expired: '로그인이나 인증이 만료됐습니다. 상태를 새로 확인하거나 다시 로그인하세요.',
  wait: '처리 중…', retryAfter: '다시 시도하기까지 남은 초:'
};
/** Untranslated target locales intentionally use the existing English fallback policy. */
export function getOwnerEnrollmentMessages(locale: string): OwnerEnrollmentMessages { return locale === 'ko' ? ko : en; }
