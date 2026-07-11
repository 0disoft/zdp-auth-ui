# Runbook

## Local Check

Use the workspace-root mustflow intents for agent-run validation:

- `zdp_auth_ui_build`
- `zdp_auth_ui_check`
- `zdp_auth_ui_browser_accessibility_check`

## CI Contract

GitHub Actions checks out `zdp-auth-ui`, resolves the published `zdp-design-system` npm package from the frozen lockfile, then runs the auth UI package build and check aliases.

The CI operation is intentionally direct and package-local, with the browser check using the hosted runner's system Chrome:

- `bun run build`
- `bun run check`
- `bun run browser:check`

If GitHub Actions does not start because account billing or spending limits block private repository runners, treat that run as a CI environment gate rather than a package check failure. Use workspace-root receipts for `zdp_auth_ui_build`, `zdp_auth_ui_check`, and `zdp_auth_ui_npm_pack_dry_run` as the current merge/release evidence until Actions can run again.

## Package Publish

정식 release는 `package.json`과 같은 `v<version>` 태그를 push해서 시작한다. 태그 workflow는 build, package check, browser check, npm pack을 다시 실행하고 GitHub Actions OIDC 기반 npm trusted publishing과 exact-version registry 확인이 끝난 뒤 같은 태그의 GitHub Release를 만든다. source repository가 private인 동안 npm provenance attestation은 지원되지 않는다.
첫 release 전에 npm의 `zdp-auth-ui` package 설정에서 Trusted Publisher를 GitHub Actions, organization `0disoft`, repository `zdp-auth-ui`, workflow filename `publish-npm.yml`, allowed action `npm publish`로 등록해야 한다. workflow는 GitHub-hosted runner와 `id-token: write`를 사용하며 장기 publish token이나 `NPM_TOKEN` repository secret은 사용하지 않는다.
Release workflow의 외부 Action은 upstream full commit SHA로 고정한다. 옆의 major-version comment는 갱신 힌트일 뿐 실행 ref가 아니며, pin을 바꾸기 전에 upstream commit 검증과 release check를 다시 수행한다.

Publish preparation uses the workspace-root mustflow intents instead of ad-hoc npm commands:

- `zdp_auth_ui_build`
- `zdp_auth_ui_check`
- `zdp_auth_ui_npm_pack_dry_run`
- `zdp_auth_ui_npm_publish_dry_run` after explicit release and network approval
- `zdp_auth_ui_npm_publish_public` after explicit release and network approval

These manual fallback intents are separate from the tag workflow. Their publish wrapper reads a caller-provided `NODE_AUTH_TOKEN` through a temporary npm user config; the normal GitHub Actions release path uses OIDC and no token. Do not write token values into this repository.

## Failure Response

- If package export validation fails, fix `package.json` and `src/lib/index.ts` together.
- If dist package validation fails, rerun `zdp_auth_ui_build` before checking package contents.
- If locale validation fails, keep `ko` and `en` active and leave the other 10 locales as planned until translation work starts.
- If a component starts owning token, session, provider secret, or DB access, stop and move that behavior to `zdp-core-platform` or the consuming app boundary.
- If CI fails during dependency installation, verify that `zdp-design-system` is published at the package range declared in `package.json` before changing package dependencies.
