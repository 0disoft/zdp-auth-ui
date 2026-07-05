# Passkey And Provider Checklist

- Browser helper runs only from a consumer-triggered interaction.
- Challenge creation and verification stay outside this package.
- Credential storage and session issue stay in `zdp-core-platform`.
- Provider buttons do not contain secrets or callback payloads.
- Native fallback with password fields uses POST only.
