# VALIDATION.md

이 문서는 `zdp-auth-ui` 변경 후 확인할 기준을 모은다. 관련 package scripts와 저장소 명령을 직접 실행한다.

## Direct Validation Commands

| Change scope | Check |
| --- | --- |
| auth UI source, locale messages, service boundary, source boundary, Svelte and TypeScript diagnostics | `bun run check` |
| password-signup field names, native required validation, terms reference, and consumer-owned password clearing | `bun run check`, `bun run browser:check` |
| native browser form validation and focus behavior | `bun run browser:check` |
| rendered Melamed login/signup handoff links and rejected-path non-rendering | `bun run browser:check` |
| desktop product-link trust, fail-closed states, fake API decisions, keyboard behavior, and DOM redaction | `bun run check`, `bun run browser:check` |
| passkey capability detection, conditional-UI autocomplete, modal and conditional ceremonies, cancellation, timeout, and typed errors | `bun run check`, `bun run build` |
| browser/Node SSR package build output or `dist/**` surface | `bun run build` |
| npm package contents or release readiness | `npm.cmd pack --dry-run --json`, `bun run check` (release tarball consumer) |
| clean consumer behavior after pack evidence | `zdp_auth_ui_clean_consumer_local_smoke` or `zdp_auth_ui_clean_consumer_smoke` |
| repository architecture contract | `bun src/cli.ts validate --architecture ../../docs/zdp-architecture --repository ../../client-surfaces/zdp-auth-ui` (cwd: `projects/zdp-platforms/architecture-tools/zdp-architecture-linter`) |
| architecture catalog or linter rule changes | `bun run validate:architecture` (cwd: `projects/zdp-platforms/architecture-tools/zdp-architecture-linter`) |
| docs-router-only changes | `docs_validate_fast` |

`zdp_auth_ui_install_frozen` is needed only when dependencies are missing or package metadata changes require dependency installation. Publish dry-run and public publish intents remain gated by explicit release approval and network access.

## Source Of Truth Checks

- Service boundary: `service.yaml`
- Package surface: `package.json`, `src/lib/index.ts`, `src/lib/auth-contract.ts`, `src/lib/auth-handoff.ts`, `src/lib/password-signup.ts`, `src/lib/i18n.ts`
- Dist builders and SSR regression: `vite.config.ts`, `vite.server.config.ts`, `tsconfig.declarations.json` used by `bun run build:svelte` (`svelte-package`), `scripts/build-package-surface.ts` (styles entry), `scripts/check-ssr-package-surface.ts`
- Package checker: `scripts/check-auth-handoff-contract.ts`, `scripts/check-passkey-progressive-enhancement.ts`, `scripts/check-auth-ui.ts`, `scripts/check-package-types.ts`
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

- `scripts/check-package-types.ts` checks source/public `ZdpAuthMessages` type parity through `tests/package-message-parity.ts`. Keep this source comparison outside the portable packed-consumer fixture. `tests/package-types.ts` uses public imports for confirmation labels and mismatch messages across all 12 locales and is also compiled from the actual release tarball.

- `vite.config.ts` must externalize dependency package roots and subpaths so the browser library never embeds a second Svelte runtime; `vite.server.config.ts` must keep Svelte external while compiling design-system components into a Node SSR entrypoint.
- `service.yaml`, `BOUNDARY.md`, `SECURITY.md`, and agent docs must agree that this package is UI-only.
- `package.json` exports, build output, and checker expectations must agree on root, `./components`, styles, i18n, and contract entrypoints. The root and `./components` `svelte` and `types` conditions resolve to `dist/svelte/**`, per-locale and loader declarations come from the browser build under `dist/i18n/**`, and browser and Node fallbacks resolve to the `dist/**` bundles.
- Locale docs and checker rules must agree that all 12 locales have login/signup copy while only reviewed feature and policy combinations are active.
- Passkey docs, source, declarations, and CI checks must agree on fail-closed capability detection, conditional UI requiring an autocomplete value ending in `webauthn`, typed cancellation and caller-bounded timeout, and server-owned challenge verification and credential storage.
- Product-link docs, source, declarations, unit checks, and browser fixture must agree that the component is disabled by default, never calls a live route, validates the trusted HTTPS verification context, and fails closed without rendering challenge references.
- Auth handoff docs, source, declarations, adversarial checks, browser fixture, and clean consumer must agree on the closed product/return-path registry, canonical HTTPS origin, fixed login/signup routes and bounded query, typed rejection, rejected-path non-rendering, and caller-owned navigation.
- Password-signup docs, source, declarations, clean consumer, and browser fixture must agree on `login_id`, `password`, required terms acceptance, terms consent reference, locale, no package-owned network call, and immediate consumer-owned password clearing.
- CI/runbook evidence must distinguish environment gates from package validation failures.

## Version Impact

`package.json` version is the package version source. Source-only agent docs under `.agents/**`, `docs/**`, `CHECKLIST.md`, and `VALIDATION.md` are not included in the current `files` allowlist. Changes to `README.md`, `RUNBOOK.md`, `BOUNDARY.md`, `SECURITY.md`, `service.yaml`, `package.json`, `src/**`, `scripts/**`, `examples/**`, or `dist/**` require a fresh package version impact decision.
