# Runbook

## Local Check

```bash
bun run check
bun run build
```

## CI Contract

GitHub Actions checks out `zdp-auth-ui`, resolves the published `zdp-design-system` npm package with `bun install --frozen-lockfile`, then runs auth UI `bun run check` and `bun run build`.

If GitHub Actions does not start because account billing or spending limits block private repository runners, treat that run as a CI environment gate rather than a package check failure. Use the workspace-root `mf run zdp_auth_ui_check` receipt plus local `bun run check`/`bun run build` output as the current merge/release evidence until Actions can run again.

## Failure Response

- If package export validation fails, fix `package.json` and `src/lib/index.ts` together.
- If locale validation fails, keep `ko` and `en` active and leave the other 10 locales as planned until translation work starts.
- If a component starts owning token, session, provider secret, or DB access, stop and move that behavior to `zdp-core-platform` or the consuming app boundary.
- If CI fails during dependency installation, verify that `zdp-design-system` is published at the package range declared in `package.json` before changing package dependencies.
