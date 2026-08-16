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

## Login And Signup Handoff

`buildZdpAuthHandoffUrl` accepts only the package's closed product and return-path registry. The auth route and query key order are fixed. Absolute and protocol-relative return values, backslashes, fragments, controls, traversal, encoded paths, malformed percent encoding, query delimiters, and unregistered paths fail closed with a typed rejection.

The caller must provide `trustedAuthOrigin` from trusted deployment configuration. The helper requires the exact canonical HTTPS origin form with no path, credential, query, or fragment, but structural validation does not make an attacker-selected domain trustworthy. The helper never reads or writes session, token, user, cookie, local or session storage, never performs a network request, and never navigates. Consumers own link rendering or navigation and must verify current session state through their own API boundary after return.

## Password Signup Form

`PasswordSignupFields` emits ordinary form fields only. It does not hash, persist, log, sign, or transmit a password. Consumers must send the value through their own trusted BFF or typed SDK, clear the in-memory password immediately after handoff, and never place it in a URL, analytics event, log, durable browser storage, fixture, or error report.

The consumer must source `termsConsentRef` from trusted application configuration for the currently published required terms. The UI package validates only a bounded reference shape; it does not prove that the referenced policy exists or is current. Trusted-edge HMAC keys and proofs stay exclusively in the server-side BFF or edge boundary and must never be provided to this package or browser code.

## Account Availability

`AuthShell` never proves that login or signup is live. Until the auth runtime route and account hostname are activated, consumers must keep account actions behind the `preparing` availability state, which disables submit, provider, and mode-change controls, blocks implicit Enter submission, and renders only a preparing notice. The package never invents or navigates to a staging or production account endpoint.

`accountBrand` is escaped display text, not an authority selector. Empty values, more than 64 Unicode code points, Unicode Other-category characters such as bidi controls, and line or paragraph separators fall back to the locale catalog default.

## Desktop Product Link

The approval component is disabled by default. It becomes actionable only when the challenge reference exactly matches trusted browser context and the verification URI uses an allowlisted HTTPS origin, the expected path, and a matching challenge query value when present. `expectedChallengeRef` and `expectedVerificationUri` must come from caller-owned trusted navigation or bootstrap context; copying either expected value from the request being validated defeats the trust boundary. Extra redirect or callback parameters fail closed.

Expired, stale, denied, consumed, malformed, and mismatched requests never expose decision controls. The component renders no challenge reference or verification URI and accepts no verifier, browser credential, session value, or product callback URL. The consumer owns the authenticated API call and must keep the live route disabled until the core runtime contract is promoted.

## Reporting

If an auth UI change can affect phishing risk, redirect behavior, handoff registry entries, provider selection, passkey ceremony, or account recovery wording, require human review before adoption.
