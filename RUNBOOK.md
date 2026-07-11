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

정식 release는 `package.json`과 같은 `v<version>` 태그를 push해서 시작한다. 태그 workflow는 build, package check, browser check, npm pack을 다시 실행하고 npm provenance publish와 exact-version registry 확인이 끝난 뒤 같은 태그의 GitHub Release를 만든다.
GitHub Actions에는 repository secret `NPM_TOKEN`이 필요하다. workflow는 npm publish step에만 이 값을 전달하며 secret 값은 source, log, example, package artifact에 기록하지 않는다.

Publish preparation uses the workspace-root mustflow intents instead of ad-hoc npm commands:

- `zdp_auth_ui_build`
- `zdp_auth_ui_check`
- `zdp_auth_ui_npm_pack_dry_run`
- `zdp_auth_ui_npm_publish_dry_run` after explicit release and network approval
- `zdp_auth_ui_npm_publish_public` after explicit release and network approval

The publish wrapper reads `NODE_AUTH_TOKEN` through a temporary npm user config. Do not write token values into this repository.

## Failure Response

- If package export validation fails, fix `package.json` and `src/lib/index.ts` together.
- If dist package validation fails, rerun `zdp_auth_ui_build` before checking package contents.
- If locale validation fails, keep `ko` and `en` active and leave the other 10 locales as planned until translation work starts.
- If a component starts owning token, session, provider secret, or DB access, stop and move that behavior to `zdp-core-platform` or the consuming app boundary.
- If CI fails during dependency installation, verify that `zdp-design-system` is published at the package range declared in `package.json` before changing package dependencies.
