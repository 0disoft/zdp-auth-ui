# Auth UI Contract Validation

Before reporting completion, verify:

- UI package still does not own identity, session, token, credential, provider secret, permission, consent, payment, or audit truth.
- Package exports and checker expectations agree.
- `ko` and `en` remain the only active locales unless translation work changed that contract.
- Passkey server challenge and credential storage remain outside the package.
- Security-sensitive copy changes are called out for human review.
- Relevant mustflow intents passed or skipped checks are named.
