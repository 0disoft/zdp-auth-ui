# Runbook

## Local Check

```bash
bun run check
bun run build
```

## CI Contract

GitHub Actions checks out `zdp-auth-ui` and sibling `zdp-design-system` under `projects/zdp-platforms/client-surfaces`, installs and builds the design-system package surface with `bun run package:build`, then installs auth UI and runs `bun run check` and `bun run build`.

Public sibling checkouts can use `github.token`. Keep repository secret `ZDP_CI_READ_TOKEN` only for private sibling repositories; the token needs contents read access to those repositories.

If GitHub Actions does not start because account billing or spending limits block private repository runners, treat that run as a CI environment gate rather than a package check failure. Use the workspace-root `mf run zdp_auth_ui_check` receipt plus local `bun run check`/`bun run build` output as the current merge/release evidence until Actions can run again.

## Failure Response

- If package export validation fails, fix `package.json` and `src/lib/index.ts` together.
- If locale validation fails, keep `ko` and `en` active and leave the other 8 locales as planned until translation work starts.
- If a component starts owning token, session, provider secret, or DB access, stop and move that behavior to `zdp-core-platform` or the consuming app boundary.
- If CI fails during design-system checkout or package-surface build, verify the checkout token boundary and `bun run package:build` in `zdp-design-system` before changing package dependencies.
