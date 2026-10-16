# Auth Handoff Registry Contract

`config/auth-handoff-registry.json` is the only editable source for login and signup handoff product IDs and allowed return paths.

Run the generator after changing the manifest.

```bash
bun run auth-handoff:generate
```

The generator owns `src/lib/auth-handoff-registry.generated.ts`. Do not edit that generated surface directly. The published handoff declaration now comes from the `svelte-package` output `dist/svelte/auth-surface-model.d.ts` instead of a block inside `scripts/build-package-surface.ts`, and `scripts/check-auth-handoff-contract.ts` runs the same generator in check mode while asserting that emitted declaration, so CI rejects manifest, runtime, or declaration drift.

The manifest remains a closed compile-time registry. It accepts no auth origin, callback URL, token, session value, user input, environment expansion, or runtime registration. Product IDs and return paths must be unique and sorted. Return paths must be canonical relative paths and must fit the handoff query bound before generation succeeds.

Every manifest change affects redirect behavior and requires human review. The consuming application still owns trusted auth-origin configuration, navigation, and post-return session verification.
