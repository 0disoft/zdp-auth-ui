# Security Copy Checklist

- No password, token, authorization header, cookie, provider secret, passkey challenge, or raw provider payload appears in docs, examples, tests, or logs.
- Help text does not imply the UI package verifies identity.
- Error copy does not reveal provider internals.
- Recovery wording does not promise account access until core identity confirms it.
- Redirect or callback wording is reviewed before broad adoption.
