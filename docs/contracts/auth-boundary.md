# Auth Boundary Contract

`zdp-auth-ui` owns visual composition and browser-facing interaction events only.

It does not own identity truth, session issue, refresh token storage, OAuth provider secrets, passkey challenge creation, passkey verification, credential persistence, permission, entitlement, consent, payment, audit decisions, datastore access, or API authority.

Auth events flow from the UI package to the consuming app, then to client SDKs or an app BFF, then to `zdp-core-platform`.

Desktop product-link UI receives already-loaded, display-safe request context and emits an approve or deny decision only. Expected challenge and verification URI values come from caller-owned trusted navigation or bootstrap context and must not be copied from the request being checked. The consuming app owns authenticated completion, and the component remains disabled until explicitly feature-gated on; it never enables a core route or navigates to a product callback.
