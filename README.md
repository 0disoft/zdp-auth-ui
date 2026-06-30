# zdp-auth-ui

ZDP의 공통 인증 UI 패키지다.

이 저장소는 Astro 공개 사이트, SvelteKit 앱 셸, Tauri Svelte 셸에서 반복되는 로그인, 회원가입, 계정 복구, 패스키, OAuth provider 선택 화면을 같은 기준으로 묶는다.

## 현재 범위

- 로그인, 회원가입, 계정 복구, 패스키, provider 선택 UI 컴포넌트
- Korean/English active message catalog
- 12개 target locale 계획 계약
- `zdp-design-system` 기반 form, button, focus, surface 소비
- passkey browser ceremony helper boundary
- public package export와 소비 계약 검사

## 현재 제외

- 실제 로그인 서버
- session 발급
- refresh token 저장
- OAuth provider secret
- passkey challenge 생성과 검증
- 계정 DB 접근
- 권한, 이용권, 동의, 감사 로그의 최종 판단

## Locale 계획

초기 active locale은 아래 2개다.

```txt
ko, en
```

완성 단계에서 추가할 planned locale은 아래 10개다.

```txt
zh, es, fr, hi, ja, vi, ru, id, ms, th
```

최종 target locale은 아래 12개다.

```txt
en, zh, es, fr, hi, ko, ja, vi, ru, id, ms, th
```

## 패키지 표면

```svelte
<script lang="ts">
  import {
    AuthShell,
    PasswordField,
    ProviderButton,
    getAuthMessages
  } from 'zdp-auth-ui';

  const messages = getAuthMessages('ko');
</script>

<AuthShell locale="ko" mode="login" providers={[{ id: 'passkey', label: messages.providers.passkey }]}>
  <PasswordField
    id="password"
    name="password"
    label={messages.fields.password}
    autocomplete="current-password"
  />
</AuthShell>
```

공통 CSS는 앱의 전역 CSS entry에서 불러온다.

```ts
import 'zdp-auth-ui/styles.css';
```

## 경계

`zdp-auth-ui`는 화면 구조와 사용자가 누르는 표면만 제공한다. 실제 인증, 세션, 패스키 challenge, OAuth callback, 이메일 인증, 계정 생성, 추천 코드 적용은 `zdp-core-platform`과 API 계약이 소유한다.

소비 앱은 이 패키지에서 발생한 submit/provider/passkey 선택을 받아 자기 API 클라이언트나 SDK에 연결한다. 이 패키지는 `fetch`, cookie, localStorage, sessionStorage, DB, provider secret을 직접 다루지 않는다.

`AuthShell`은 submit callback이 있거나 명시적인 `action`이 없으면 브라우저 기본 form 제출을 막는다. 명시적인 native form fallback도 password가 URL과 로그에 남지 않도록 POST만 허용한다. 회원가입 화면에 `referralCode`를 넘기면 submit detail과 POST hidden field에만 포함하고, 이 패키지는 추천 코드 검증·보상·저장을 하지 않는다.

## rodi-site-template-svelte에서 반영한 후보

- `@simplewebauthn/browser`: passkey 브라우저 ceremony helper 후보로 도입했다. 서버 검증과 credential 저장은 이 저장소가 소유하지 않는다.
- `zdp-design-system`: 인증 화면의 시각 기준이며 npm package range `^0.45.0`으로 소비한다.

`better-auth`, `drizzle-orm`, `@libsql/client`, server captcha, cookie consent, sitemap, markdown renderer는 인증 UI 패키지에 넣지 않는다.

## 검증

```bash
bun run check
bun run build
```

`check`는 package export, locale 계약, service boundary, auth UI source boundary, Svelte compile surface, 금지 dependency를 함께 확인한다.

이 저장소가 private 상태이면 GitHub Actions hosted runner가 account billing 또는 spending limit 상태 때문에 job 시작 전에 막힐 수 있다. 이 경우 실패한 Actions run은 코드 검증 실패가 아니라 CI 실행 환경 gate로 본다. 현재 package 변경 검증 증거는 workspace root에서 실행한 `mf run zdp_auth_ui_check` receipt와 위 로컬 check/build 결과를 우선한다.

GitHub Actions CI는 `zdp-auth-ui`만 checkout하고 published `zdp-design-system` npm package를 `bun install --frozen-lockfile`로 해결한다. 그 다음 auth UI `bun run check`, `bun run build`를 실행한다.
