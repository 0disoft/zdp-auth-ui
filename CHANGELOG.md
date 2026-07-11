# Changelog

## Unreleased

- No unreleased changes.

## 0.1.12

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
