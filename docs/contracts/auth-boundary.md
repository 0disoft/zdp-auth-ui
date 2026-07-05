# Auth Boundary Contract

`zdp-auth-ui` owns visual composition and browser-facing interaction events only.

It does not own identity truth, session issue, refresh token storage, OAuth provider secrets, passkey challenge creation, passkey verification, credential persistence, permission, entitlement, consent, payment, audit decisions, datastore access, or API authority.

Auth events flow from the UI package to the consuming app, then to client SDKs or an app BFF, then to `zdp-core-platform`.
