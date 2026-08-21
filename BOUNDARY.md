# Boundary

`zdp-auth-ui` owns authentication UI composition only.

## Owns

- Login, signup, recovery, passkey, provider-choice, and feature-gated desktop product-link approval layout
- Message-keyed login and signup labels for all 12 account-route languages
- Planned 10-locale contract
- Design-system consumption
- Browser-only passkey start helper boundary
- Closed-registry login/signup handoff URL composition for static products
- Portable password-signup field composition aligned to the Core registration input names

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
- Authentication-state lookup, return navigation, or auth-origin trust configuration

## Required Handoff

```txt
Auth UI event
  -> consuming Astro/SvelteKit/Tauri surface
  -> zdp-client-sdks or app BFF
  -> zdp-core-platform
```

No auth UI component may bypass that route by calling core datastores or storing token material.

`PasswordSignupFields` owns only native form controls and stable field names for login ID, password, required terms acceptance, terms consent reference, and locale. The consumer owns trusted terms-version selection, submission, trusted-edge proof generation, error mapping, password clearing, and the BFF or typed-SDK call into Core. This package must not call the staging registration route or treat a rendered form as evidence that account creation is available.

The `AuthShell` availability gate is a rendering contract only. When `availability` is `preparing`, the shell disables submit, provider, and mode-change controls, blocks implicit Enter submission, hides the recovery link, and shows the active-locale preparing notice. The consumer chooses the state from its own trusted configuration; rendering a preparing shell never navigates, fetches, or changes auth state, and it is never evidence that login or signup is live.

The `AuthShell` busy state is also consumer-controlled UI state only. When `busy` is true on an available surface, the shell exposes `aria-busy`, disables its fieldset so shell-owned actions and slotted native controls cannot race the active request, blocks duplicate native or programmatic submission, and shows the active-locale waiting notice. The consumer owns request execution, timeout, cancellation, result handling, and clearing `busy`; the package does not observe the network or retain submitted values. `preparing` takes precedence if both inputs are supplied.

The optional `accountBrand` is display-only consumer configuration. It substitutes the locale catalog's account brand after bounded text validation and does not select an identity provider, auth origin, account authority, permission, or session.

`buildZdpAuthHandoffUrl` is a pure composition boundary. It accepts a caller-trusted, pathless, credential-free canonical HTTPS auth origin and only registered product/return-path pairs. It returns a typed created or rejected result and never fetches, reads authentication state, stores data, or navigates. The consuming product owns the trusted origin configuration, renders or follows the resulting URL, and verifies the current session through its own BFF or API after return.

`ProductLinkApproval` accepts already-loaded display context and emits only an approve or deny decision with the expected opaque challenge reference. The consumer must supply expected challenge and verification URI values from its own trusted navigation or bootstrap context, not copy them from the request under validation. The component does not call a live route, navigate to a product callback, exchange a verifier, or issue a session. Consumers must keep it feature-gated until the core product-link runtime is promoted.
