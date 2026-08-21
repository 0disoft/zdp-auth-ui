# Changelog

## Unreleased

- No unreleased changes.

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
