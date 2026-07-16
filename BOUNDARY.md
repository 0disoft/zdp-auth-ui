# Boundary

`zdp-auth-ui` owns authentication UI composition only.

## Owns

- Login, signup, recovery, passkey, provider-choice, and feature-gated desktop product-link approval layout
- Message keys and active Korean/English labels
- Planned 10-locale contract
- Design-system consumption
- Browser-only passkey start helper boundary

## Does Not Own

- User identity truth
- Session issuance
- Refresh token storage
- OAuth provider secrets
- Passkey challenge creation or verification
- Credential persistence
- Permission, entitlement, consent, payment, or audit decisions
- Direct datastore access
- Product callback navigation or desktop credential handoff

## Required Handoff

```txt
Auth UI event
  -> consuming Astro/SvelteKit/Tauri surface
  -> zdp-client-sdks or app BFF
  -> zdp-core-platform
```

No auth UI component may bypass that route by calling core datastores or storing token material.

`ProductLinkApproval` accepts already-loaded display context and emits only an approve or deny decision with the expected opaque challenge reference. The consumer must supply expected challenge and verification URI values from its own trusted navigation or bootstrap context, not copy them from the request under validation. The component does not call a live route, navigate to a product callback, exchange a verifier, or issue a session. Consumers must keep it feature-gated until the core product-link runtime is promoted.
