# Security

`zdp-auth-ui` is a UI package and must not become an authentication authority.

## Sensitive Values

Never store or log:

- Passwords
- Access tokens
- Refresh tokens
- Authorization headers
- OAuth provider secrets
- Passkey challenges
- Raw provider callback payloads
- Session cookies

## Passkeys

The browser helper may call WebAuthn browser APIs from a consumer-triggered interaction. Server challenge creation, attestation/assertion verification, credential storage, and session issue stay in `zdp-core-platform`.

## Reporting

If an auth UI change can affect phishing risk, redirect behavior, provider selection, passkey ceremony, or account recovery wording, require human review before adoption.

