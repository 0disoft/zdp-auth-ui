# zdp-auth-ui

ZDP의 공통 인증 UI 패키지다.

이 저장소는 Astro 공개 사이트, SvelteKit 앱 셸, Tauri Svelte 셸에서 반복되는 로그인, 회원가입, 계정 복구, 패스키, OAuth provider 선택 화면을 같은 기준으로 묶는다.

## 현재 범위

- 로그인, 회원가입, 계정 복구, 패스키, provider 선택 UI 컴포넌트
- Korean/English active message catalog
- 10개 locale 계획 계약
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

완성 단계에서 추가할 planned locale은 아래 8개다.

```txt
es, zh, hi, fr, ja, de, pt, id
```

최종 target locale은 아래 10개다.

```txt
en, es, zh, hi, ko, fr, ja, de, pt, id
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

`zdp-auth-ui`는 화면 구조와 사용자가 누르는 표면만 제공한다. 실제 인증, 세션, 패스키 challenge, OAuth callback, 이메일 인증, 계정 생성은 `zdp-core-platform`과 API 계약이 소유한다.

소비 앱은 이 패키지에서 발생한 submit/provider/passkey 선택을 받아 자기 API 클라이언트나 SDK에 연결한다. 이 패키지는 `fetch`, cookie, localStorage, sessionStorage, DB, provider secret을 직접 다루지 않는다.

## rodi-site-template-svelte에서 반영한 후보

- `@simplewebauthn/browser`: passkey 브라우저 ceremony helper 후보로 도입했다. 서버 검증과 credential 저장은 이 저장소가 소유하지 않는다.
- `zdp-design-system`: 인증 화면의 시각 기준이다.

`better-auth`, `drizzle-orm`, `@libsql/client`, server captcha, cookie consent, sitemap, markdown renderer는 인증 UI 패키지에 넣지 않는다.

## 검증

```bash
bun run check
bun run build
```

`check`는 package export, locale 계약, service boundary, Svelte compile surface, 금지 dependency를 함께 확인한다.

GitHub Actions CI는 `zdp-auth-ui`와 private sibling `zdp-design-system`을 같은 workspace 모양으로 checkout한 뒤 design-system `dist/` package surface를 `bun run package:build`로 만든다. 그 다음 auth UI install, `bun run check`, `bun run build`를 실행한다. private design-system checkout에는 repository secret `ZDP_CI_READ_TOKEN`을 설정한다.
