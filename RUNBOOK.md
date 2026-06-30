# Runbook

## Local Check

```bash
bun run build
bun run check
```

## CI Contract

GitHub Actions checks out `zdp-auth-ui`, resolves the published `zdp-design-system` npm package with `bun install --frozen-lockfile`, then runs auth UI `bun run build` and `bun run check`.

If GitHub Actions does not start because account billing or spending limits block private repository runners, treat that run as a CI environment gate rather than a package check failure. Use the workspace-root `mf run zdp_auth_ui_build`, `mf run zdp_auth_ui_check`, and `mf run zdp_auth_ui_npm_pack_dry_run` receipts as the current merge/release evidence until Actions can run again.

## Package Publish

Publish preparation uses the workspace-root mustflow intents instead of ad-hoc npm commands:

- `mf run zdp_auth_ui_build`
- `mf run zdp_auth_ui_check`
- `mf run zdp_auth_ui_npm_pack_dry_run`
- `mf run zdp_auth_ui_npm_publish_dry_run --allow-approval network_access`
- `mf run zdp_auth_ui_npm_publish_public --allow-approval network_access`

The publish wrapper reads `NODE_AUTH_TOKEN` through a temporary npm user config. Do not write token values into this repository.

## Failure Response

- If package export validation fails, fix `package.json` and `src/lib/index.ts` together.
- If dist package validation fails, run `bun run build` before checking package contents.
- If locale validation fails, keep `ko` and `en` active and leave the other 10 locales as planned until translation work starts.
- If a component starts owning token, session, provider secret, or DB access, stop and move that behavior to `zdp-core-platform` or the consuming app boundary.
- If CI fails during dependency installation, verify that `zdp-design-system` is published at the package range declared in `package.json` before changing package dependencies.
