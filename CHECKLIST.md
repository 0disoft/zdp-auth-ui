# CHECKLIST.md

이 저장소는 ZDP client surface가 공유하는 인증 UI package를 소유한다. 작업 전 변경 대상이 UI boundary, package surface, locale messages, passkey ceremony, security copy, consumer fixture 중 어디인지 먼저 고른다.

## Common Boundary

- Identity, session, refresh token, OAuth secret, permission, entitlement, consent, payment, audit truth를 소유하지 않는다.
- Component state, examples, tests, logs에 password, token, authorization header, provider secret, passkey challenge, raw provider payload를 남기지 않는다.
- Authentication result는 consuming app, client SDK or BFF, `zdp-core-platform` 경로로 넘긴다.
- Product-specific signup policy, referral reward, recovery eligibility, provider allowlist truth를 이 package에 넣지 않는다.

## Package Surface

- Public imports are package root, `./styles.css`, `./i18n`, and `./contract`.
- Export entries must point at `dist/**`, not `src/**`.
- Clean consumer fixtures must use package imports and message-keyed labels.
- CSS is a package side effect only through `./dist/styles.css`.
- Externalize dependency package roots and subpaths, especially `svelte/internal/*`, so consumers do not load a second Svelte runtime.
- Package publish evidence must include build, check, and npm pack dry-run intents before release work.

## Locale Messages

- Login and signup copy is complete for all 12 target locales.
- Planned locales remain planned for unreviewed auth features and policy activation.
- User-facing auth text stays behind message keys.
- UI labels must be product-facing, not implementation explanations.
- Copy that changes phishing risk, account recovery meaning, redirect expectation, or provider trust requires human review.

## Passkey And Provider UI

- Browser helper may prepare WebAuthn ceremony data only from a user-triggered interaction.
- Challenge creation, attestation/assertion verification, credential storage, and session issue stay in `zdp-core-platform`.
- Provider selection UI must not embed provider secrets, callback payloads, or authorization headers.
- Native form fallback must use POST when password fields are present.

## Password Signup

- Keep `login_id`, `password`, required terms acceptance, terms consent reference, and locale aligned with the Core registration contract.
- Source the terms consent reference from trusted consumer configuration, not user-controlled input.
- Keep trusted-edge HMAC proof generation and Core network calls in the consumer BFF or typed SDK.
- Clear consumer-owned password state immediately after handoff and never persist or log it.

## Desktop Product Link

- Keep `ProductLinkApproval` disabled until the consuming app explicitly enables the contract-only surface.
- Match the opaque challenge against trusted browser context and accept only the allowlisted HTTPS verification origin and exact route.
- Show product, requested scopes and capabilities, account, workspace, consent implications, and expiry before decisions.
- Keep approve and deny explicit; stale, expired, denied, consumed, malformed, mismatched, and redirect-bearing requests fail closed.
- Do not render the challenge reference or verification URI, accept a verifier or browser credential, or navigate to a product callback.
- The consuming app owns the authenticated completion call; this package does not enable a live backend route.

## Design System

- Use `zdp-design-system` public exports and shared CSS.
- Do not fork local form, focus, surface, or button primitives unless a package boundary change is reviewed.
- Keep auth UI reusable across Astro islands, SvelteKit app shells, and Tauri Svelte shells.

## Manual Gates

- Broad auth screen adoption requires manual approval.
- Package release requires user authorization and the documented publish procedure.
- CI billing or private-runner startup failures are environment gates, not package validation failures.
