# Runbook

## Local Check

```bash
bun run check
bun run build
```

## CI Contract

GitHub Actions checks out `zdp-auth-ui` and private sibling `zdp-design-system` under `projects/zdp-platforms/client-surfaces`, installs with `bun install --frozen-lockfile`, then runs `bun run check` and `bun run build`.

Keep repository secret `ZDP_CI_READ_TOKEN` configured while `zdp-design-system` remains private. The token only needs contents read access to `zdp-design-system`.

## Failure Response

- If package export validation fails, fix `package.json` and `src/lib/index.ts` together.
- If locale validation fails, keep `ko` and `en` active and leave the other 8 locales as planned until translation work starts.
- If a component starts owning token, session, provider secret, or DB access, stop and move that behavior to `zdp-core-platform` or the consuming app boundary.
- If CI fails during design-system checkout, verify `ZDP_CI_READ_TOKEN` before changing package dependencies.
