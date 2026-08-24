# Auth Handoff Registry Checklist

- Edit `config/auth-handoff-registry.json`, never the generated TypeScript or declaration block.
- Keep product IDs and return paths unique, lexicographically sorted, and reviewable as static data.
- Do not add auth origins, callbacks, credentials, session values, environment expansion, or runtime registration.
- Run `bun run auth-handoff:generate` after manifest changes.
- Run `bun run auth-handoff:check` and `bun scripts/check-auth-handoff-contract.ts` before reporting completion.
- Treat every product or return-path addition as a redirect-security change requiring human review.
- Bump the package version and changelog when generated package output changes.
