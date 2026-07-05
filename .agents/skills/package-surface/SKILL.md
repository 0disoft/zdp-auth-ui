# Package Surface Skill

## Use When

Package exports, `files`, build output, clean consumer fixtures, style entrypoints, or release readiness change.

## Procedure

1. Read `package.json`, `scripts/build-package-surface.ts`, `scripts/check-auth-ui.ts`, and `examples/clean-consumer/AuthUiCleanConsumer.svelte`.
2. Keep public entrypoints limited to package root, `./styles.css`, `./i18n`, and `./contract` unless the package contract is deliberately expanded.
3. Do not point package consumers at `src/**`.
4. Check version impact when packaged files or package metadata change.
5. Verify with `zdp_auth_ui_build`, `zdp_auth_ui_check`, and `zdp_auth_ui_npm_pack_dry_run` when package output changes.
