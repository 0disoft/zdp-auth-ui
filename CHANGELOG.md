# Changelog

## Unreleased

## 0.11.1

- Adopt Design System 0.67.0 and its nested overlay and external-close focus fixes.
- Preserve form resets after document and shadow-root moves, isolate locale and validation policy lists, and keep product-link focus and expiry tied to the active interaction.
- Preserve passkey ceremony ownership during cancellation, validate options before replacing active requests, and let browsers select credential storage by default.

- Restore passkey editor focus within its own document or shadow root, resolve directory triggers from the selected menu instead of global IDs, and pass custom trigger content through a named snippet with browser and SSR coverage.

- Export passkey settings contracts and `validateProductLinkRequest` from `zdp-auth-ui/contract`, add the catalog-free `zdp-auth-ui/passkey` browser helper entry, and check all seven existing lean Props aliases plus utility exports in type, bundle and packed-consumer checks.

- Cover Korean password signup with the lean components, fixed catalog and public contract factory in bundle and SSR checks, and import the factory's locale constants from the schema to prevent other catalogs entering the initial bundle.

- Focus the passkey removal confirmation title when no input is present, restore the row control on cancellation, and focus the settings region if the selected row disappears.

- Reannounce repeated `waiting` and `registered` feedback by clearing and refilling the existing polite live region on a new sequence, preserve input focus, and cancel superseded or unmounted announcements.

## 0.11.0

- Let the root `createZdpAuthSurfaceModel` accept optional `messages`, and export a catalog-free `createZdpAuthSurfaceModel` with its related types from `zdp-auth-ui/components`; that entry requires `messages` and stays out of the initial 12-locale runtime.
- Wire the native WebAuthn failure identifiers back into `WebAuthnError` causes for duplicate registration, invalid user ID, and unsupported algorithm codes, while passing the ambiguous `SecurityError`, `NotAllowedError`, and `ConstraintError` cases through unchanged instead of guessing from message strings.
- Reuse one `Intl.DateTimeFormat` per locale in `PasskeySettings` and derive the key name from an untouched `null` plus the edited value, empty string included, instead of syncing it from an effect, so changing locale or preference keeps what the user typed.
- Move the locale JavaScript and declaration build to typed source modules plus `svelte-package`, remove the Vite string-template plugin, and keep the public import paths while the generated files live under `dist/svelte/i18n`; checks now cover schema and literal locale parity, all 12 lazy chunks, and packed-consumer imports.
- Replace the source snapshot checks with runtime export, type, and behavior checks.

## 0.10.0

- Added a `zdp-auth-ui/components` entry that exports the seven UI components without the synchronous catalog runtime. Its `AuthShell`, `LoginIdField`, `PasswordField`, `PasswordSignupFields`, `ProductLinkApproval`, and `PasskeySettings` require caller-injected `messages`, and `PasskeySettings` also requires `authMessages`; consumers pass one fixed `zdp-auth-ui/i18n/<locale>` catalog or load it at runtime so one locale arrives instead of all twelve.
- Kept the root export as compatibility adapters whose `messages` props stay optional and still default to the synchronous `getAuthMessages()` and `getPasskeySettingsMessages()` lookups, including the `PasskeySettings.authMessages` fallback.
- Split the single message module into per-locale auth and passkey-settings catalogs authored against a shared schema and froze every catalog once at initialization, and translated the product-link copy and the provider passkey label across all 12 target locales; no feature gate or locale is activated by this work.
- The locale loader returns `{ locale, messages, passkeySettingsMessages }` from one import through `loadAuthLocale()`, `loadAuthMessages()` and `loadPasskeySettingsMessages()` remain available, and each `zdp-auth-ui/i18n/<locale>` entry now exposes the matching `passkeySettingsMessages`.
- Rebuilt the components with Svelte 5 runes and adopted the standard `svelte-package` pipeline, so the `svelte` condition ships packaged `.svelte` files that the consumer's own compiler builds, native snippets and design-system slots render in dev SSR, and the string-based SSR component-identity rewrite and manual declaration generator are removed.
- Named the account brand through explicit `{brand}` and `{minimumAge}` placeholders that `AuthShell` and `PasswordSignupFields` fill from the normalized brand and signup contract, so translated summaries no longer hardcode the default `8ailors` brand.
- Narrowed the password reveal reset watch to the input's own ancestor removals instead of whole-tree document mutations, and trimmed the surrounding signup copy.
- Scoped passkey ceremonies to the caller's own `AbortSignal` and optional `container`, issued native `navigator.credentials` requests instead of the SDK global abort service, deep-copied registration options, and trimmed the age-policy reference before validation; the behavior checks were reworked to assert locale and build output without source snapshots.

## 0.9.4

- Use shared foundation CSS without loading a remote font stylesheet. Consumers own font delivery.
- Keep the browser and SSR authentication surfaces on Design System 0.65.0.

## 0.9.3

- Adopt Design System 0.65.0 for shared authentication components and styles.
- Preserve product-link review expiry across clock rollback with a monotonic clock.

## 0.9.2

- Design System 0.64.1과 Vite·Playwright 갱신을 반영했다.

- 공개 타입을 TypeScript·Svelte 소스에서 생성하도록 바꿔 수작업 선언 복제를 제거하고, 압축 패키지의 선언과 실제 peer 타입을 함께 검사한다.

- 패스키 설정의 잠금·오류 표시·포커스에도 요청 sequence를 적용해 이전 응답이 현재 작업에 영향을 주지 않도록 했다.

- 패스키 설정의 성공 응답을 요청 sequence와 연결하고, 이전 성공 상태가 다음 편집기를 닫지 않도록 수정했다.

## 0.9.1

- 패스키 공급자 버튼에 사용자와 열쇠 아이콘을 적용했다.
- 패스키 등록 방식 선택과 authenticator metadata 타입을 공개 패키지에 제공하고, 기본 키 이름은 기기 메타데이터를 포함하지 않도록 정리했다.

## 0.9.0

- Add a shared passkey management surface with a safe metadata list, inline add/rename/revoke editors and server-selected reauthentication prompts.
- Keep capability gates, pending locks, action callbacks and confirmed results consumer-owned. Clear passwords after handoff or cancellation and cover all 12 auth locales.

## 0.8.14

- Share the same-task interaction guard across provider selection, password submission and mode changes, including disabled providers.
- Verify passkey selection locks password fields and duplicate clicks start only one consumer callback.

## 0.8.13

- Include `fields.passwordConfirmation` and `feedback.passwordMismatch` in published locale declarations.
- Check the complete source and public message type shapes for drift, and verify both fields through public imports in the packed consumer.

## 0.8.12

- Include `signupTermsInSlot` in the published `AuthShellProps` declaration and check it through a package import so consumers can use the terms-link fix with TypeScript.

## 0.8.11

- Avoid a duplicate terms link when a preparing signup screen already renders the consent fields; keep the link available for shells without those fields.

## 0.8.10

- Place the signup terms link below the required checkbox on narrow screens so translated acceptance text and the link remain fully visible.

## 0.8.9

- This is the combined package update since the published 0.5.18 release: password confirmation, all 12 locale catalog types, pending-error focus, same-task submission protection, and decision-time product-link validation.
- Package and release checks now cover the full Svelte/TypeScript project and packed consumer declarations. CI and trusted publishing use Bun 1.4.2, matching the locally verified current stable toolchain.

## 0.8.8

- Rejects same-task duplicate auth submissions and related provider or mode actions before the consumer's `busy` prop can render, while leaving request completion with the consumer.

## 0.8.7

- Corrected the published `AuthShell` prop declaration to include its existing `busy` state, and added a package-import type check for consumers.

## 0.8.6

- Checks runtime imports and all-locale TypeScript access from files extracted from the release tarball in an isolated consumer directory.

## 0.8.5

- Added whole-project Svelte and TypeScript diagnostics to the package check and aligned PR CI with the release workflow's Node 24 runtime.

## 0.8.4

- Revalidates product-link trust and expiry when a decision button is clicked, even if a delayed deadline timer still leaves the button visible.

## 0.8.3

- Focuses newly visible authentication errors after a pending request ends, including the legacy status path used by current web apps.
- Keeps success status text outside the error presentation and avoids focusing a stale fallback error when typed feedback is cleared.

## 0.8.2

- Corrected the published locale catalog declaration to expose all 12 message catalogs, while keeping feature activation limited to the reviewed locales.
- Added a package-import TypeScript check so generated declarations cannot silently narrow the public catalog again.

## 0.8.1

- Refreshed the registry dependency lines to `zdp-design-system ^0.63.0` and `@simplewebauthn/browser ^14.0.0`, adopted current toolchain minors, and kept the TypeScript `^6.0.3` compiler line the package contract checks require.

## 0.8.0

- Require password confirmation in shared signup fields, with localized mismatch feedback in all 12 locales. Confirmation stays in the browser, blocks mismatched submissions, and clears when the consumer clears the password.

## 0.7.1

- Updated the published design-system dependency to `zdp-design-system ^0.61.0` so authentication surfaces consume the current form-control chrome and the simplified TermSheet package contract without a nested older design-system copy.

## 0.7.0

- Added fail-closed WebAuthn, conditional-UI, and platform-authenticator capability detection for shared authentication surfaces.
- Added modal and conditional passkey authentication, caller-bounded ceremony timeouts, explicit cancellation, and stable typed error reasons while keeping challenge verification and session authority server-owned.
- Added opt-in `username webauthn` support to `LoginIdField` and executable regression coverage for unsupported, successful, cancelled, timed-out, and conditional browser paths.

## 0.6.0

- Added opt-in `zdp-auth-ui/i18n/<locale>` package entrypoints for all 12 account-route locales so consumers can import one message catalog without loading the synchronous all-locale compatibility surface.
- Added `zdp-auth-ui/i18n/loader` with `loadAuthMessages()` for dynamic locale loading and English fallback for unsupported locale values.
- Generated every isolated catalog and its declaration from the existing synchronous message SSOT during the Vite package build, avoiding a second translation source.
- Added package contract coverage for all 26 generated locale assets, fixed-locale imports, runtime loading, and English fallback.

## 0.5.22

- Added a pure shared authentication surface model that composes trusted consumer feature flags, localized provider labels, and optional links into stable `AuthShell` display props.
- Kept authentication authority, route calls, session state, credentials, submit state, and server feedback mapping outside the shared UI model.

## 0.5.21

- Moved the closed login/signup handoff product and return-path registry into a declarative manifest with deterministic generated TypeScript and package declaration output.
- Added CI drift detection and manifest-wide contract coverage so new products cannot bypass canonical path, uniqueness, ordering, or query-size constraints.

## 0.5.20

- Added closed typed authentication feedback codes for waiting, registration, invalid input, invalid credentials, rate limits, expiry, and temporary unavailability.
- Centralized localized feedback copy, alert/status semantics, error focus, and repeat announcements while preserving the legacy `status` and `invalid` props.

## 0.5.19

- Added a consumer-controlled `AuthShell` busy state that marks the form with `aria-busy`, freezes submit, provider, mode-change, and slotted form controls, blocks duplicate submission, and exposes the localized waiting message.
- Added a focused Chromium regression covering busy-state entry, duplicate-event rejection, and interaction restoration.

## 0.5.18

- Kept consumer-configured terms and privacy links visible on preparing signup screens while avoiding a duplicate terms link on active signup forms.

## 0.5.17

- Rejected control, bidi-format, private-use, line-separator, and other unsafe Unicode code points in consumer account brands, with a tested fallback to the locale default.

## 0.5.16

- Added an optional bounded `accountBrand` display prop so shared account screens do not leak the default 8ailors brand into other ZDP products.

## 0.5.15

- Restored trusted publishing for the private source repository after npm rejected explicit provenance; provenance remains unavailable until npm supports private GitHub sources or the repository becomes public.

## 0.5.14

- Aligned the published design-system dependency with `zdp-design-system ^0.59.1` so current consumers keep one shared component runtime.
- Required npm provenance explicitly when trusted publishing creates the verified release artifact.

## 0.5.13

- Opened consumer-configured terms links in an opener-isolated new tab so entered authentication form data remains in place.
- Centered the required-terms checkbox mark on the first line of its enlarged consent copy.

## 0.5.12

- Increased authentication headings, summaries, labels, controls, and supporting copy by one shared typography step.

## 0.5.11

- Moved the consumer-configured terms link beside the required signup consent checkbox instead of the form footer.

## 0.5.10

- Added localized login and signup copy for all 12 account-route languages while keeping unreviewed signup policy activation consumer-controlled.

## 0.5.9

- Clarified the Korean signup summary as direct 8ailors account creation copy.

## 0.5.8

- Matched the password visibility button to the input row height and kept it beside the input at narrow widths.

## 0.5.7

- Removed the redundant brand eyebrow from `AuthShell` so product shells can own brand identity without repeating it above every authentication title.

## 0.5.6

- Isolated npm trusted-publishing OIDC authority in a minimal publish job that accepts only the verified tarball, manifest, and release notes from the read-only preparation job.

## 0.5.5

- Rejected dotted, bracketed, and other separator-based redirect, callback, session, token, cookie, proof, and verifier query aliases before product-link approval controls become actionable.

## 0.5.4

- Made account recovery navigation consumer-configured and login-only so signup and inactive recovery flows no longer advertise a route that does not exist.

## 0.5.3

- Preserved server component identity in the production SSR bundle so SvelteKit
  development SSR can render consumer slot markup without crashing on an empty
  component context.
- Added a build-time rewrite that keeps `renderer.component(fn, Component)` two-argument
  boundaries in `dist/index.server.js`, plus a dev-mode consumer regression check.

## 0.5.2

- Updated the design-system, Svelte, Vite, Node type, and browser-test dependency graph while retaining the TypeScript 6 compiler API contract used by package verification.

## 0.5.1

- Added separate browser and Node SSR package entrypoints so SvelteKit consumers no longer prerender the client-compiled Svelte bundle.
- Added a server-render regression that compiles the design-system dependency for SSR and proves the preparing state remains fail closed.

## 0.5.0

- Keep Svelte, design-system, and WebAuthn package subpaths external in the library build so consuming Svelte applications do not load a second embedded runtime.
- Added dist artifact and Chromium regression coverage proving the published bundle keeps `svelte/internal/*` external and renders `AuthShell` with the consuming application's single Svelte runtime.

- Added a typed `available`/`preparing` availability gate to `AuthShell` with Korean/English message keys so account surfaces can render a disabled, non-submittable preparing state while the auth runtime route and account hostname stay inactive.
- Blocked submit, provider, mode-change, recovery, and implicit Enter submission while preparing, with fail-closed source and Chromium regression coverage.
- Added clean-consumer coverage for the availability gate without adding live endpoints, account navigation, storage, or network ownership.

## 0.4.0

- Added a portable password-signup field contract for `login_id`, `password`, required terms acceptance, an immutable terms consent reference, and locale.
- Added shared login-ID and password-signup field components with native required-field validation and Korean/English message keys.
- Added clean-consumer and Chromium regression coverage for required-field focus order, Core-aligned field names, terms evidence, and immediate consumer-owned password clearing.
- Kept network calls, trusted-edge proof generation, account creation, credential persistence, and session issuance outside the UI package.

## 0.3.0

- Updated the published design-system dependency to `zdp-design-system ^0.50.6` so auth UI consumers share the current theme, Select, typography, and package asset contracts without a nested legacy design-system copy.
- Added a pure typed login/signup handoff URL helper for static products with a closed `melamed` return-path registry.
- Added canonical credential-free HTTPS auth-origin validation and fail-closed rejection of absolute, protocol-relative, backslash, fragment, control, traversal, encoded, malformed, delimiter-bearing, and unregistered return paths.
- Added generated declarations, package checker coverage, adversarial contract tests, browser-rendered canonical link and rejected-path regression coverage, and clean-consumer links without adding authentication-state, storage, network, or navigation ownership.

## 0.2.0

- Added a feature-gated desktop product-link approval screen that shows the requesting product, requested scopes and capabilities, account and workspace context, consent implications, and expiry.
- Added fail-closed challenge and HTTPS verification-route validation for stale, expired, denied, consumed, mismatched, and redirect-bearing requests.
- Added unit contract coverage and a fake-API browser flow covering explicit keyboard-operable approval and denial without rendering opaque challenge references.

## 0.1.12

- Applied the immutable Action and non-persistent checkout policy to main package CI while preserving its explicit read-only token permission.
- Attached the exact npm tarball and a machine-readable SHA-512/source manifest to each GitHub Release, with byte-for-byte verification on idempotent reruns.
- Pinned every release workflow action to a verified upstream commit SHA so mutable action tags cannot change code executed with npm OIDC and release permissions.
- Packed once per release and verified the published registry integrity against that exact tarball so validation and publication cannot diverge.
- Added a tag-triggered release workflow that builds and verifies the package, performs GitHub Actions OIDC trusted publishing without a long-lived npm token, verifies the exact registry version, and creates the matching GitHub Release. npm provenance remains unavailable while the source repository is private.
- Pinned the Bun CI and release toolchain and bounded tag publishing with per-tag concurrency and a 20-minute job timeout.
- Bound reruns and post-publish verification to npm's immutable `gitHead` so moved or mismatched release tags cannot create a misleading GitHub Release.

## 0.1.11

- Replaced copied design-system version checks with package range, Bun registry integrity, and installed-package reconciliation.
- Added regression fixtures for malformed integrity, duplicate lock entries, and incompatible caret-range resolutions.

## 0.1.10

- Added a real Chromium regression gate proving native required-field validation blocks auth submit callbacks and focuses the invalid password field.
- Updated the published design-system dependency to `zdp-design-system ^0.46.4` so the release consumes the Card semantics and browser accessibility gate package surface.

## 0.1.9

- Kept native browser constraint validation enabled for explicit POST fallback forms, added regression coverage for required password fields, and adopted `zdp-design-system ^0.46.3`.

## 0.1.8

- Updated the published design-system dependency to `zdp-design-system ^0.46.1` so auth UI consumers resolve the latest design-system package surface without a nested older copy.

## 0.1.7

- Updated the published design-system dependency to `zdp-design-system ^0.46.0` so auth UI consumers share the same Svelte peer floor and generated package surface.

## 0.1.6

- Moved the root `types` and `svelte` package conditions to the generated `dist/` surface so clean Svelte/Vite consumers do not recompile package source from `node_modules`.
- Removed `src/` from the published npm file list.
- Raised the Svelte peer dependency floor to `^5.56.0` to match the compiler/runtime surface verified by clean Svelte/Vite consumers.

## 0.1.5

- Moved JavaScript and CSS package exports to the generated `dist/` package surface while keeping the root Svelte compiler and type conditions on source.
- Added generated declaration files and a single published `styles.css` entry for consumer imports.
- Documented the mustflow npm publish preparation flow.

## 0.1.4

- Switched `zdp-design-system` consumption from a local sibling checkout to the published npm package range.
- Added public package metadata and MIT license for npm package consumption.

## 0.1.3

- Added a signup-only referral code submit surface without giving the auth UI package referral validation, reward, or storage ownership.

## 0.1.2

- Prevented auth shell submit callbacks and missing actions from falling through to native form submission.
- Constrained auth shell form submission to POST and moved brand, provider group, and account-help labels behind message keys.
- Expanded the auth UI checker source-boundary scan across `src/lib` auth UI source files.
- Tightened auth shell mode-change typing so Svelte consumers keep `ZdpAuthMode` instead of widened string values.

## 0.1.1

- Added GitHub Actions CI for the auth UI package boundary.
- Added CI contract checks for the private `zdp-design-system` sibling checkout.
- Replaced the fixed initial-version checker with current package version and changelog sync validation.

## 0.1.0

- Added the initial auth UI package boundary.
- Added Korean and English active auth messages.
- Added the 10-locale target contract with 8 planned locales.
- Added `AuthShell`, `ProviderButton`, and `PasswordField` Svelte components.
- Added a passkey browser helper boundary using `@simplewebauthn/browser`.
- Added a package/service contract checker.
