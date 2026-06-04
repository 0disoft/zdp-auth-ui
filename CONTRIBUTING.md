# Contributing

## 원칙

- 인증 화면의 UI 반복은 이 저장소에서 줄인다.
- 인증의 최종 진실은 `zdp-core-platform`에 남긴다.
- 시각 스타일은 `zdp-design-system` public export만 소비한다.
- 사용자 문구는 message key로 관리한다.
- active locale은 `ko`, `en`이다. planned locale은 번역 파일을 추가하기 전까지 fallback만 허용한다.

## 금지

- refresh token, access token, OAuth secret, authorization header 저장
- passkey challenge 생성 또는 검증
- cookie/session 직접 발급
- 계정 DB 접근
- 제품별 가입 정책, 권한, 결제, 동의 판단
- `better-auth`, database client, server-only SDK를 이 패키지에 직접 추가

## 검사 기준

- `AuthShell`, `ProviderButton`, `PasswordField`는 Svelte compiler warning 없이 컴파일된다.
- package export와 public types가 README 예제와 일치한다.
- 10개 target locale 목록이 `src/lib/i18n.ts`와 README에 함께 남는다.
- `@simplewebauthn/browser`는 browser ceremony helper 후보로만 남고 서버 검증 책임을 갖지 않는다.

