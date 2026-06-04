# Boundary

`zdp-auth-ui` owns authentication UI composition only.

## Owns

- Login, signup, recovery, passkey, and provider-choice component layout
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

## Required Handoff

```txt
Auth UI event
  -> consuming Astro/SvelteKit/Tauri surface
  -> zdp-client-sdks or app BFF
  -> zdp-core-platform
```

No auth UI component may bypass that route by calling core datastores or storing token material.

