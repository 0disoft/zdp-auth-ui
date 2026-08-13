# AGENTS.md

## Read Order

1. `AGENTS.md`
2. `BOUNDARY.md`
3. `SECURITY.md`
4. `CHECKLIST.md`
5. `VALIDATION.md`
6. `.agents/README.md`
7. `.agents/context-map.md`
8. Matching `.agents/checklists/*.md`
9. Matching `.agents/skills/*/SKILL.md`
10. Matching `.agents/validations/*.md`
11. Relevant `docs/**`, `service.yaml`, `package.json`, `src/**`, `scripts/**`, `examples/**`

## Scope

This repository owns shared authentication UI surfaces for ZDP client screens.

## Rules

- Do not own identity, session, refresh token, OAuth secret, permission, entitlement, consent, payment, or audit truth.
- Keep login, signup, recovery, passkey, and provider-choice UI reusable across Astro islands, SvelteKit app shells, and Tauri Svelte shells.
- Use `zdp-design-system` public exports and shared CSS instead of local visual forks.
- Keep auth copy behind message keys. Login and signup copy covers all 12 target locales; feature and policy activation remains separately reviewed.
- Browser passkey helpers may prepare UI ceremony data, but server challenge creation, verification, session issue, and credential storage stay in `zdp-core-platform`.
- Do not store tokens, provider secrets, authorization headers, passwords, passkey challenges, or raw user identifiers in component state beyond the immediate browser interaction.
- User-visible text must be natural and product-facing; implementation descriptions must not leak into labels.
