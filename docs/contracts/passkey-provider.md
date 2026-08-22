# Passkey And Provider Contract

The browser passkey helper may detect WebAuthn, conditional UI, and platform-authenticator capability without creating a challenge or reading credential material. Unsupported and failed capability probes return a fail-closed support result.

Authentication may use modal or conditional mediation. Conditional mediation requires browser support and an input whose `autocomplete` value ends with `webauthn`; `LoginIdField` exposes `username webauthn` for that purpose. Consumers may disable the DOM input check only when they own an equivalent input outside the ordinary document tree.

Browser ceremonies expose typed errors for unsupported environments, conditional-UI rejection, missing autofill input, programmatic cancellation, caller-bounded timeout, browser denial, invalid options, security failures, and authenticator failures. A consumer that needs a deterministic timeout classification must pass `timeoutMs`; native browser dismissal and browser-owned timeout can otherwise arrive through the same `NotAllowedError` boundary.

The browser helper may start or cancel a consumer-triggered ceremony. It may not create server challenges, verify attestation or assertion responses, store credentials, issue sessions, persist provider payloads, or infer authentication success from a browser response.

Provider buttons are selection UI. They do not own provider truth, provider secrets, authorization headers, callback payloads, or redirect policy.

Native form fallback with password fields must use POST so passwords do not leak through URLs or logs.
