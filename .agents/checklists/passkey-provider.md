# Passkey And Provider Checklist

- Capability probes fail closed and never read credentials.
- Browser helper runs only from a consumer-triggered interaction, except conditional UI initialization owned by the consuming surface.
- Conditional UI requires support detection and an autocomplete value ending in `webauthn`.
- Programmatic cancellation and caller-bounded timeout remain typed and do not imply server verification.
- Challenge creation and verification stay outside this package.
- Credential storage and session issue stay in `zdp-core-platform`.
- Provider buttons do not contain secrets or callback payloads.
- Native fallback with password fields uses POST only.
