# Auth Copy Skill

## Use When

Auth labels, help text, error text, locale catalogs, provider wording, recovery wording, or passkey ceremony copy changes.

## Procedure

1. Read `src/lib/i18n.ts`, `src/lib/contract.ts`, `BOUNDARY.md`, and `SECURITY.md`.
2. Keep login and signup messages complete across all 12 target locales.
3. Leave unreviewed feature and legal-policy combinations planned even when their basic auth copy exists.
4. Keep product copy natural and do not leak implementation explanations.
5. Require human review for wording that changes phishing risk, account recovery meaning, provider trust, redirect expectation, or passkey ceremony meaning.
6. Verify with `zdp_auth_ui_check`.
