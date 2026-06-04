# Runbook

## Local Check

```bash
bun run check
```

## Failure Response

- If package export validation fails, fix `package.json` and `src/lib/index.ts` together.
- If locale validation fails, keep `ko` and `en` active and leave the other 8 locales as planned until translation work starts.
- If a component starts owning token, session, provider secret, or DB access, stop and move that behavior to `zdp-core-platform` or the consuming app boundary.

