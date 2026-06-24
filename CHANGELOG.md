# Changelog

## Unreleased

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
