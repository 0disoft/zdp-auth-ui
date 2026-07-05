# Runbook

## Local Check

Use the workspace-root mustflow intents for agent-run validation:

- `zdp_auth_ui_build`
- `zdp_auth_ui_check`

## CI Contract

GitHub Actions checks out `zdp-auth-ui`, resolves the published `zdp-design-system` npm package from the frozen lockfile, then runs the auth UI package build and check aliases.

If GitHub Actions does not start because account billing or spending limits block private repository runners, treat that run as a CI environment gate rather than a package check failure. Use workspace-root receipts for `zdp_auth_ui_build`, `zdp_auth_ui_check`, and `zdp_auth_ui_npm_pack_dry_run` as the current merge/release evidence until Actions can run again.

## Package Publish

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
