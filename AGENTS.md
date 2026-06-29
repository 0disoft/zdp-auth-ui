# AGENTS.md

## Scope

This repository owns shared authentication UI surfaces for ZDP client screens.

## Rules

- Do not own identity, session, refresh token, OAuth secret, permission, entitlement, consent, payment, or audit truth.
- Keep login, signup, recovery, passkey, and provider-choice UI reusable across Astro islands, SvelteKit app shells, and Tauri Svelte shells.
- Use `zdp-design-system` public exports and shared CSS instead of local visual forks.
- Keep auth copy behind message keys. Korean and English are active now; Chinese, Spanish, French, Hindi, Japanese, Vietnamese, Russian, Indonesian, Malay, and Thai are planned.
- Browser passkey helpers may prepare UI ceremony data, but server challenge creation, verification, session issue, and credential storage stay in `zdp-core-platform`.
- Do not store tokens, provider secrets, authorization headers, passwords, passkey challenges, or raw user identifiers in component state beyond the immediate browser interaction.
- User-visible text must be natural and product-facing; implementation descriptions must not leak into labels.
