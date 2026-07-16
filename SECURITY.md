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

## Desktop Product Link

The approval component is disabled by default. It becomes actionable only when the challenge reference exactly matches trusted browser context and the verification URI uses an allowlisted HTTPS origin, the expected path, and a matching challenge query value when present. `expectedChallengeRef` and `expectedVerificationUri` must come from caller-owned trusted navigation or bootstrap context; copying either expected value from the request being validated defeats the trust boundary. Extra redirect or callback parameters fail closed.

Expired, stale, denied, consumed, malformed, and mismatched requests never expose decision controls. The component renders no challenge reference or verification URI and accepts no verifier, browser credential, session value, or product callback URL. The consumer owns the authenticated API call and must keep the live route disabled until the core runtime contract is promoted.

## Reporting

If an auth UI change can affect phishing risk, redirect behavior, provider selection, passkey ceremony, or account recovery wording, require human review before adoption.
