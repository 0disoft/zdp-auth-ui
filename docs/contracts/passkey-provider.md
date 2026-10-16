# Passkey And Provider Contract

The browser passkey helper may detect WebAuthn, conditional UI, and platform-authenticator capability without creating a challenge or reading credential material. Unsupported and failed capability probes return a fail-closed support result.

Authentication may use modal or conditional mediation. Conditional mediation requires browser support and an input whose `autocomplete` value ends with `webauthn`; `LoginIdField` exposes `username webauthn` for that purpose. The helper checks for that input inside `container` when one is supplied and inside `document` otherwise, so a surface that renders its login field in a shadow root supplies that root and keeps the check on. Set `verifyBrowserAutofillInput: false` only when the input sits outside every `ParentNode` root the caller can provide.

Browser ceremonies expose typed errors for unsupported environments, conditional-UI rejection, missing autofill input, programmatic cancellation, caller-bounded timeout, browser denial, invalid options, security failures, and authenticator failures. A consumer that needs a deterministic timeout classification must pass `timeoutMs`; native browser dismissal and browser-owned timeout can otherwise arrive through the same `NotAllowedError` boundary.

Native `navigator.credentials` failures are classified locally, without the SDK's global abort service or private helper imports. The public `ZdpPasskeyCeremonyError.reason` keeps its existing categories; when the native exception and the registration options identify a failure, the ceremony error's `cause` is a `WebAuthnError` whose `code` names the diagnostic and whose own `cause` holds the original browser exception. Those diagnostics cover duplicate registration, invalid user-ID length, missing public-key parameters, unavailable algorithms, browser abort and general authenticator errors. A registration `NotSupportedError` maps to `authenticator-error` when public-key parameters are present and to `invalid-options` when they are absent; authentication `NotSupportedError` stays `unsupported`.

`SecurityError`, `NotAllowedError` and `ConstraintError` pass through as the original browser exception, without parsing message text or guessing a more specific cause. A differing RP ID can still be a valid parent domain or a related origin, so `SecurityError` alone does not prove the RP ID is invalid; validating origin and RP-ID relationships stays with the browser.

The browser helper may start or cancel a consumer-triggered ceremony. It may not create server challenges, verify attestation or assertion responses, store credentials, issue sessions, persist provider payloads, or infer authentication success from a browser response.

## Ceremony cancellation and concurrency

Registration and authentication both accept `ZdpPasskeyCeremonyOptions`, which carries `timeoutMs` and `signal`. Pass the caller's own `AbortController.signal`; aborting it cancels only the ceremony started by that call and reports `cancelled`. A signal that is already aborted when the call starts rejects at once with `cancelled` and leaves any in-flight prompt alone, and aborting an earlier caller's signal after a newer call begins has no effect on the newer request. An abort that lands while the helper is still awaiting a browser capability probe settles the call as `cancelled` before any prompt opens, so a late browser prompt does not surface. Both kinds clone the caller's options with `structuredClone` before the ceremony consumes them, so mutating the original object after the call cannot reach the browser request.

The package maintains a single-flight policy: a new ceremony replaces the previous in-flight request, and `cancelPasskeyCeremony()` remains the explicit whole-cancel entry point for whichever ceremony is active. Per-call cancellation does not cancel another direct SDK consumer. A component that owns an `AbortController` registers teardown independently of its event handler so an unmounted surface does not leave a prompt running:

```ts
import { onDestroy } from 'svelte';

const controller = new AbortController();
onDestroy(() => controller.abort());

async function handlePasskeySignIn() {
  // options are supplied by the consuming server.
  return await startPasskeyAuthentication(options, { signal: controller.signal });
}
```

Provider buttons are selection UI. They do not own provider truth, provider secrets, authorization headers, callback payloads, or redirect policy.

Consumers can pass a `kind: 'passkey'` provider to `AuthShell` and handle `onproviderselect`. Selection, submit and mode-change callbacks share a same-task guard. Set `busy` synchronously before beginning the server request, keep it set through the browser ceremony and completion request, and clear it on failure or dismissal. Provider availability must come from the consuming server's rollout gate; browser capability alone does not activate a route.

`startPasskeyAuthentication` returns SimpleWebAuthn JSON, including `clientExtensionResults`. Core's WebAuthn credential parser accepts that field as an alias for `extensions`. Forward the immediate response without persisting it or treating it as a verified login. Do not automatically replay begin or complete after a network error; a fresh user interaction starts a new ceremony.

Native form fallback with password fields must use POST so passwords do not leak through URLs or logs.

## Management surface

`PasskeySettings` renders only safe metadata (`passkey_id`, `label`, `created_at`, `last_used_at`) and consumer-controlled capabilities. Its default is preparing with no actionable controls. Never infer the reauthentication method or mutation availability from the browser or from an empty list; source both from the authenticated server.

Rows may also carry server-supplied authenticator metadata: `provider` (`windows_hello`, `google_password_manager`, `bitwarden`, `apple_passwords`, or `unknown`), `storage` (`synced` or `device_bound`), and `backed_up`. Provider names and storage wording come from the shared message catalog. An unlisted provider renders as a neutral passkey label and an unlisted storage value renders as an unknown storage location, so the component never guesses a brand or a storage state. `synced` is described as sync-capable and backup-eligible, never as proof that the key is synchronized right now. When the field is present, each row shows the provider badge and the storage and backup state beside the label and dates.

The register editor sends an optional `preference` (`device`, `manager`, `security_key`, `phone`) that records the user's stated intent and seeds a localized default name. Until the user edits the name field, the component keeps that default name in sync with the selected preference; an entered name is retained. The browser or password manager still decides where the credential is stored, so this choice is a hint only: do not promise that it bypasses a password manager extension, and do not treat it as a storage, consent, or authorization guarantee.

The component emits immediate add, rename or revoke intentions through `onaction`. The consumer sets `busy` synchronously, owns server reauthentication and browser ceremonies, and refreshes the list after a confirmed write. Registration and revocation require current-session, operation and exact-target-bound reauthentication on the server. Rename stays disabled until its owning server contract exists. No UI success, ceremony response or stale capability is an authorization decision.

Password input is cleared on cancellation and immediately after callback handoff. No password, grant, challenge, public key material or browser payload is persisted or included in metadata. A lost write response uses `unconfirmed` feedback, which disables mutation controls. The consumer must reload authoritative state before clearing that feedback for a new user-initiated attempt; do not automatically replay the change. Removing an account credential does not claim to remove its saved entry from the user's authenticator.
