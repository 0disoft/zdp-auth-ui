# Typed Auth Feedback Contract

`AuthShell` accepts an optional `feedback` value so consuming products map API outcomes to a closed UI contract instead of passing server text directly into the shared authentication surface.

Supported codes are `waiting`, `registered`, `invalid_input`, `invalid_credentials`, `rate_limited`, `expired`, and `unavailable`. The package selects the localized message, ARIA role, live-region priority, and visual error treatment. Error codes move focus to the feedback surface after a client-side update. `waiting` and `registered` remain polite status messages and do not steal focus.

Consumers that need to announce the same code more than once increment the optional non-negative `sequence`. The sequence is used only as an update key and is never rendered.

`feedback` takes precedence over the legacy `status` and `invalid` props. Those props remain available for compatibility and become visible again when `feedback` is cleared.

The consumer must translate API and SDK errors into these UI codes. Raw server messages, stack traces, provider payloads, account identifiers, tokens, and credential material must not enter the feedback contract. `rate_limited` intentionally uses the same generic temporary-unavailable copy as `unavailable`; the code remains distinct for consumer control and privacy-safe metrics without exposing authentication policy details.
