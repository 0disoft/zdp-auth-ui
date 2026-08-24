# Auth Handoff Registry Contract

`config/auth-handoff-registry.json` is the only editable source for login and signup handoff product IDs and allowed return paths.

Run the generator after changing the manifest.

```bash
bun run auth-handoff:generate
```

The generator owns `src/lib/auth-handoff-registry.generated.ts` and the handoff declaration block inside `scripts/build-package-surface.ts`. Do not edit either generated surface directly. `scripts/check-auth-handoff-contract.ts` runs the same generator in check mode, so CI rejects manifest, runtime, or declaration drift.

The manifest remains a closed compile-time registry. It accepts no auth origin, callback URL, token, session value, user input, environment expansion, or runtime registration. Product IDs and return paths must be unique and sorted. Return paths must be canonical relative paths and must fit the handoff query bound before generation succeeds.

Every manifest change affects redirect behavior and requires human review. The consuming application still owns trusted auth-origin configuration, navigation, and post-return session verification.
