# Auth UI Agent Notes

Start with `BOUNDARY.md`, `SECURITY.md`, `CHECKLIST.md`, and `VALIDATION.md`. This package is reusable authentication UI, not an identity service.

## High-Risk Mistakes

- Adding token, session, provider secret, passkey challenge, or datastore ownership to component code.
- Treating provider choice labels as provider truth.
- Moving signup, recovery, referral, or authorization policy into UI components.
- Publishing package surface changes without build, check, pack, and approval evidence.

## Local Routes

- `.agents/checklists/package-surface.md`
- `.agents/checklists/locale-messages.md`
- `.agents/checklists/passkey-provider.md`
- `.agents/checklists/security-copy.md`
- `.agents/skills/package-surface/SKILL.md`
- `.agents/skills/auth-copy/SKILL.md`
- `.agents/validations/auth-ui-contract.md`
