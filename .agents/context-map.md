# Context Map

| Work type | Read first | Validate with |
| --- | --- | --- |
| Package exports or dist | `package.json`, `scripts/build-package-surface.ts`, `scripts/check-auth-ui.ts` | `zdp_auth_ui_build`, `zdp_auth_ui_check`, `zdp_auth_ui_npm_pack_dry_run` |
| Locale message text | `src/lib/i18n.ts`, `src/lib/contract.ts`, `scripts/check-auth-ui.ts` | `zdp_auth_ui_check` |
| Passkey or provider UI | `BOUNDARY.md`, `SECURITY.md`, `src/lib/passkey.ts`, component source | `zdp_auth_ui_check` |
| Consumer fixture | `examples/clean-consumer/AuthUiCleanConsumer.svelte`, `package.json` | `zdp_auth_ui_build`, `zdp_auth_ui_npm_pack_dry_run` |
| Service contract | `service.yaml`, `BOUNDARY.md`, `SECURITY.md` | `zdp_architecture_validate_auth_ui_repository` |
| Agent docs only | `CHECKLIST.md`, `VALIDATION.md`, `.agents/**`, `docs/**` | `docs_validate_fast` |
