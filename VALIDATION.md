# VALIDATION.md

이 문서는 `zdp-auth-ui` 변경 후 확인할 기준을 모은다. 실행 권한은 mustflow command contract가 소유한다.

## Configured Validation

| Change scope | Check |
| --- | --- |
| auth UI source, locale messages, service boundary, source boundary | `zdp_auth_ui_check` |
| password-signup field names, native required validation, terms reference, and consumer-owned password clearing | `zdp_auth_ui_check`, `zdp_auth_ui_browser_accessibility_check` |
| native browser form validation and focus behavior | `zdp_auth_ui_browser_accessibility_check` |
| rendered Melamed login/signup handoff links and rejected-path non-rendering | `zdp_auth_ui_browser_accessibility_check` |
| desktop product-link trust, fail-closed states, fake API decisions, keyboard behavior, and DOM redaction | `zdp_auth_ui_check`, `zdp_auth_ui_browser_accessibility_check` |
| package build output or `dist/**` surface | `zdp_auth_ui_build` |
| npm package contents or release readiness | `zdp_auth_ui_npm_pack_dry_run` |
| clean consumer behavior after pack evidence | `zdp_auth_ui_clean_consumer_local_smoke` or `zdp_auth_ui_clean_consumer_smoke` |
| repository architecture contract | `zdp_architecture_validate_auth_ui_repository` |
| architecture catalog or linter rule changes | `zdp_architecture_validate_fast` |
| docs-router-only changes | `docs_validate_fast` |

`zdp_auth_ui_install_frozen` is needed only when dependencies are missing or package metadata changes require dependency installation. Publish dry-run and public publish intents remain gated by explicit release approval and network access.

## Source Of Truth Checks

- Service boundary: `service.yaml`
- Package surface: `package.json`, `src/lib/index.ts`, `src/lib/auth-contract.ts`, `src/lib/auth-handoff.ts`, `src/lib/password-signup.ts`, `src/lib/i18n.ts`
- Dist builder: `scripts/build-package-surface.ts`
- Package checker: `scripts/check-auth-handoff-contract.ts`, `scripts/check-auth-ui.ts`
- Release workflow: `.github/workflows/publish-npm.yml`, `scripts/check-release-workflow.ts`
- Consumer fixture: `examples/clean-consumer/AuthUiCleanConsumer.svelte`
- Boundary docs: `BOUNDARY.md`, `SECURITY.md`
- Operator docs: `RUNBOOK.md`
- Agent docs: `AGENTS.md`, `CHECKLIST.md`, `.agents/**`, `docs/**`

## Forbidden Value Checks

아래 값은 source, tests, examples, docs, package metadata에 들어가면 안 된다.

- password
- access token
- refresh token
- authorization header
- OAuth provider secret
- passkey challenge
- raw provider callback payload
- session cookie
- raw account identifier
- customer data path

## Contract Drift Checks

- `service.yaml`, `BOUNDARY.md`, `SECURITY.md`, and agent docs must agree that this package is UI-only.
- `package.json` exports, build output, and checker expectations must agree on root, styles, i18n, and contract entrypoints.
- Locale docs and checker rules must agree that only `ko` and `en` are active now.
- Passkey docs and source must agree that server challenge and credential storage stay outside this package.
- Product-link docs, source, declarations, unit checks, and browser fixture must agree that the component is disabled by default, never calls a live route, validates the trusted HTTPS verification context, and fails closed without rendering challenge references.
- Auth handoff docs, source, declarations, adversarial checks, browser fixture, and clean consumer must agree on the closed product/return-path registry, canonical HTTPS origin, fixed login/signup routes and bounded query, typed rejection, rejected-path non-rendering, and caller-owned navigation.
- Password-signup docs, source, declarations, clean consumer, and browser fixture must agree on `login_id`, `password`, required terms acceptance, terms consent reference, locale, no package-owned network call, and immediate consumer-owned password clearing.
- CI/runbook evidence must distinguish environment gates from package validation failures.

## Version Impact

`package.json` version is the package version source. Source-only agent docs under `.agents/**`, `docs/**`, `CHECKLIST.md`, and `VALIDATION.md` are not included in the current `files` allowlist. Changes to `README.md`, `RUNBOOK.md`, `BOUNDARY.md`, `SECURITY.md`, `service.yaml`, `package.json`, `src/**`, `scripts/**`, `examples/**`, or `dist/**` require a fresh package version impact decision.
