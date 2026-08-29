# zdp-auth-ui

ZDP의 공통 인증 UI 패키지다.

이 저장소는 Astro 공개 사이트, SvelteKit 앱 셸, Tauri Svelte 셸에서 반복되는 로그인, 회원가입, 계정 복구, 패스키, OAuth provider 선택 화면을 같은 기준으로 묶는다.

## 현재 범위

- 로그인, 회원가입, 계정 복구, 패스키, provider 선택 UI 컴포넌트
- Login and signup message catalogs for all 12 account-route languages
- 12개 target locale 계획 계약
- `zdp-design-system` 기반 form, button, focus, surface 소비
- passkey browser ceremony helper boundary
- feature-gated desktop product-link approval and denial UI
- static product용 login/signup handoff URL helper
- `login_id + password + 필수 약관 동의`를 위한 portable signup field contract
- AuthShell availability gate (`available`/`preparing`) — 계정 서비스가 준비 중일 때 제출, provider, 모드 변경을 막고 준비 중 카피를 노출
- AuthShell controlled busy state — 인증 요청 중 submit, provider, 모드 변경, slotted form control을 잠그고 대기 상태를 노출
- dist 기반 public package export와 소비 계약 검사

## 현재 제외

- 실제 로그인 서버
- session 발급
- refresh token 저장
- OAuth provider secret
- passkey challenge 생성과 검증
- 계정 DB 접근
- 권한, 이용권, 동의, 감사 로그의 최종 판단

## Locale 계획

전체 인증 기능이 active인 locale은 아래 2개다.

```txt
ko, en
```

아래 10개 locale도 로그인·회원가입 문구는 제공한다. 다만 약관 검토와 기능별 승격 전까지 다른 인증 기능의 planned 상태는 유지한다.

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
    PasswordSignupFields,
    ProviderButton,
    createZdpPasswordSignupContract,
    getAuthMessages
  } from 'zdp-auth-ui';

  const messages = getAuthMessages('ko');
  const signupResult = createZdpPasswordSignupContract({
    termsConsentRef: 'policy://terms/2026-08-01',
    locale: 'ko'
  });
</script>

<AuthShell locale="ko" mode="login" accountBrand="ZDP" providers={[{ id: 'passkey', label: messages.providers.passkey }]}>
  <PasswordField
    id="password"
    name="password"
    label={messages.fields.password}
    autocomplete="current-password"
  />
</AuthShell>

{#if signupResult.outcome === 'created'}
  <AuthShell locale="ko" mode="signup">
    <PasswordSignupFields
      idPrefix="account-signup"
      contract={signupResult.contract}
    />
  </AuthShell>
{/if}
```

공통 CSS는 앱의 전역 CSS entry에서 불러온다.

```ts
import 'zdp-auth-ui/styles.css';
```

정적 제품은 package root의 순수 TypeScript helper로 auth 화면 URL을 만들 수 있다.

```ts
import { buildZdpAuthHandoffUrl } from 'zdp-auth-ui';

const handoff = buildZdpAuthHandoffUrl({
  mode: 'login',
  productId: 'melamed',
  trustedAuthOrigin: 'https://accounts.zdp.example',
  returnPath: '/apply'
});

if (handoff.outcome === 'created') {
  // 소비 앱이 handoff.url을 링크에 넣거나 자기 navigation 계층으로 전달한다.
}
```

`trustedAuthOrigin`은 소비 앱이 배포 설정에서 신뢰한 auth origin이어야 한다. helper는 이 값이 path, credential, query, fragment가 없는 canonical HTTPS origin인지 확인할 뿐, 임의의 도메인을 신뢰 목록에 올려주지 않는다. 제품 ID와 return path는 package의 닫힌 registry를 통과해야 하며 현재 공개 계약은 `melamed`의 `/apply`만 허용한다. login/signup route와 query key 순서는 helper가 고정하고, 실패는 예외나 fallback URL 대신 typed `rejected` 결과로 반환한다.

`zdp-auth-ui`의 root type condition, JavaScript import, CSS entry는 모두 `dist/` 산출물을 가리킨다. root `svelte` condition은 브라우저에서 `dist/index.js`, Node SSR에서 `dist/index.server.js`를 선택한다. 순수 TypeScript subpath인 `./i18n`, `./contract`도 `dist/*.d.ts`와 `dist/*.js`를 사용한다. `bun run build`는 브라우저와 Node SSR Vite bundle을 만든 뒤 선언·스타일 파일을 생성하고 SSR preparing 상태를 실제로 render한다. 소비 앱은 `src/` deep import를 쓰지 않고, npm clean consumer도 package source를 다시 컴파일하지 않는다. `examples/clean-consumer/AuthUiCleanConsumer.svelte`는 package root import, message-keyed provider labels, password label/help/error override, submit/provider/mode callbacks, disabled-by-default product-link 소비를 확인하는 최소 fixture다.

## 계정 준비 상태

`AuthShell`은 `availability` prop으로 `available`(기본값) 또는 `preparing` 상태를 받는다. `preparing` 상태에서는 제출, provider, 모드 변경 컨트롤이 모두 비활성화되고, 텍스트 필드에서 Enter로 인한 암묵적 제출도 차단된다. 대신 `계정 서비스는 아직 준비 중입니다.` / `Account access is not available yet.` 안내가 status 영역으로 노출되고, 복구 링크는 숨겨진다.

회원가입이 `available`이면 필수 약관 링크는 `PasswordSignupFields`의 동의 항목 옆에만 렌더링한다. 가입 필드가 없는 `preparing` 화면에서는 `AuthShell` footer가 소비 앱이 준 이용약관과 개인정보 링크를 유지한다.

소비 앱은 선택적 `accountBrand`에 `ZDP`처럼 사용자에게 표시할 계정 브랜드를 전달할 수 있다. 값은 앞뒤 공백을 제거한 뒤 Unicode Other 범주와 줄·문단 구분자가 없는 64 코드포인트 이하 텍스트로만 사용되며, 인증 주체나 권한을 바꾸지 않는다. 생략하거나 잘못된 값이면 기존 locale catalog의 `8ailors` 기본값을 유지한다.

이 게이트는 렌더링 계약일 뿐이다. 실제 로그인/회원가입 route와 account hostname이 활성화되기 전에는 소비 앱이 계정 버튼을 live link로 바꾸지 말고 이 상태를 사용해야 한다. `preparing` 화면을 렌더링한다고 해서 계정 생성이나 로그인이 가능하다는 뜻이 아니며, package는 이 상태에서 어떤 endpoint나 navigation도 만들지 않는다.

## 인증 요청 진행 상태

소비 앱은 자기 API 요청을 시작하기 직전에 `busy={true}`를 전달하고 완료·실패·취소 시 `false`로 되돌린다. `busy`인 동안 `AuthShell`은 form에 `aria-busy="true"`를 표시하고 fieldset을 비활성화해 submit, provider, 모드 변경, slot 안의 native form control을 잠근다. native 또는 programmatic 중복 submit도 callback으로 넘기지 않으며 현재 locale의 `status.waiting` 문구를 status 영역에 노출한다.

```svelte
<AuthShell
  locale="ko"
  mode="login"
  busy={submitting}
  onsubmit={async ({ form }) => {
    submitting = true;
    try {
      await authenticate(new FormData(form));
    } finally {
      submitting = false;
    }
  }}
>
  <PasswordField id="password" name="password" required />
</AuthShell>
```

`busy`는 네트워크 상태를 추론하거나 요청을 실행하지 않는다. 요청 실행, timeout, 취소, 오류 매핑과 `busy` 해제는 소비 앱 책임이다. `availability="preparing"`과 `busy`를 동시에 주면 준비 상태가 우선하며 진행 중 요청으로 표시하지 않는다.

## 경계

`zdp-auth-ui`는 화면 구조와 사용자가 누르는 표면만 제공한다. 실제 인증, 세션, 패스키 challenge, OAuth callback, 이메일 인증, 계정 생성, 추천 코드 적용은 `zdp-core-platform`과 API 계약이 소유한다.

소비 앱은 이 패키지에서 발생한 submit/provider/passkey 선택을 받아 자기 API 클라이언트나 SDK에 연결한다. 이 패키지는 `fetch`, cookie, localStorage, sessionStorage, DB, provider secret을 직접 다루지 않는다.

`PasswordSignupFields`는 Core의 password registration 입력 이름에 맞춘 form field만 렌더링한다. 소비 앱은 submit event에서 값을 즉시 자기 BFF 또는 typed SDK로 넘기고 password 변수를 지운다. 이 패키지는 trusted-edge HMAC proof를 만들거나 staging registration route를 직접 호출하지 않으며, 계정 생성 성공·실패와 session 발급도 판단하지 않는다. `termsConsentRef`는 소비 앱이 현재 게시된 필수 약관 버전에서 만든 신뢰된 참조를 전달해야 하고, 임의 사용자 입력을 그대로 넣으면 안 된다.

`buildZdpAuthHandoffUrl`은 인증 상태를 읽거나 쓰지 않고 URL 문자열만 만든다. session, token, user, cookie, storage, network call, navigation은 모두 소비 앱과 auth runtime의 책임이다. absolute URL, protocol-relative path, backslash, fragment, control character, traversal, encoded path, query delimiter, malformed encoding, registry 밖 경로는 fail closed다.

`AuthShell`은 submit callback이 있거나 명시적인 `action`이 없으면 브라우저 기본 form 제출을 막는다. 명시적인 native form fallback도 password가 URL과 로그에 남지 않도록 POST만 허용하고, `required` 같은 브라우저 constraint validation을 그대로 유지한다. 계정 복구 링크는 로그인 화면에서 소비 앱이 활성 `recoveryHref`를 명시한 경우에만 렌더링하며, 회원가입 화면이나 기본 상태에서는 존재하지 않는 복구 경로를 만들지 않는다. 회원가입 화면에 `referralCode`를 넘기면 submit detail과 POST hidden field에만 포함하고, 이 패키지는 추천 코드 검증·보상·저장을 하지 않는다.

`ProductLinkApproval`은 데스크톱 제품 계정 연결의 검토 화면만 제공한다. 요청 제품, scope와 capability, 계정·워크스페이스, 동의 영향, 만료를 보여주고 명시적인 승인·거부 callback을 낸다. 기본값은 비활성화이며, 소비 앱이 자기 소유의 신뢰된 navigation/bootstrap context에서 준 expected challenge·verification URI와 allowlist HTTPS route가 정확히 맞을 때만 버튼이 열린다. expected 값을 검증 대상 request에서 그대로 복사하면 trust boundary가 사라지므로 금지한다. redirect·callback query, 오래되거나 만료된 요청, 거절·소비 완료 상태는 fail closed다. challenge reference와 verification URI는 DOM에 렌더링하지 않고, verifier·브라우저 credential·product callback URL은 prop이나 event 계약에 포함하지 않는다.

이 컴포넌트는 core API를 직접 호출하지 않는다. consuming app이 기존 인증 session과 API client로 complete 요청을 소유하며, core product-link runtime 승격 전에는 feature flag를 켜지 않는다.

## rodi-site-template-svelte에서 반영한 후보

- `@simplewebauthn/browser`: passkey 브라우저 ceremony helper 후보로 도입했다. 서버 검증과 credential 저장은 이 저장소가 소유하지 않는다.
- `zdp-design-system`: 인증 화면의 시각 기준이며 npm package range `^0.61.0`로 소비한다.

`better-auth`, `drizzle-orm`, `@libsql/client`, server captcha, cookie consent, sitemap, markdown renderer는 인증 UI 패키지에 넣지 않는다.

## 검증

```bash
bun run build
bun run check
```

`build`는 npm package에 들어갈 dist surface를 만들고, `check`는 package export, locale 계약, service boundary, auth UI source boundary, clean consumer fixture, Svelte compile surface, 금지 dependency를 함께 확인한다.
`release:check`는 `v<package version>` 태그가 build, package/browser 검증, GitHub Actions OIDC 기반 npm trusted publishing, exact-version registry 확인, 같은 태그의 GitHub Release 생성으로 이어지는 workflow 계약을 확인한다. 첫 release 전에 npm package 설정의 Trusted Publisher를 `0disoft/zdp-auth-ui`와 `publish-npm.yml`에 연결해야 한다. source repository가 private인 동안 npm provenance attestation은 만들지 않는다.

이 저장소가 private 상태이면 GitHub Actions hosted runner가 account billing 또는 spending limit 상태 때문에 job 시작 전에 막힐 수 있다. 이 경우 실패한 Actions run은 코드 검증 실패가 아니라 CI 실행 환경 gate로 본다. 현재 package 변경 검증 증거는 workspace root에서 실행한 `mf run zdp_auth_ui_build`, `mf run zdp_auth_ui_check`, `mf run zdp_auth_ui_npm_pack_dry_run` receipt를 우선한다.

GitHub Actions CI는 `zdp-auth-ui`만 checkout하고 published `zdp-design-system` npm package를 `bun install --frozen-lockfile`로 해결한다. 그 다음 auth UI `bun run build`, `bun run check`를 실행한다.
Main CI token은 `contents: read`로 제한하고 외부 Action은 reviewed full commit SHA만 실행하며 checkout credential persistence를 끈다.

디자인 시스템 검사는 버전이나 integrity를 검사 코드에 복사하지 않는다. `package.json`의 caret range, `bun.lock` registry tuple과 SHA-512 digest, `node_modules`의 실제 설치 버전을 순서대로 대조한다.
