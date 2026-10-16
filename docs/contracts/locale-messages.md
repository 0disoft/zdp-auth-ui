# Locale Messages Contract

Korean and English are active locales. Chinese, Spanish, French, Hindi, Japanese, Vietnamese, Russian, Indonesian, Malay, and Thai are planned locales.

Auth UI text must stay behind message keys. User-visible strings should be natural product copy, not implementation explanations. Copy that changes account recovery meaning, provider trust, redirect expectations, phishing risk, or passkey ceremony meaning requires human review before broad adoption.

## Sources of truth

`src/lib/i18n/schema.ts` owns the shared readonly message types and the target, active, and planned locale lists. Auth catalogs live in `src/lib/i18n/auth/<locale>.ts` and passkey management catalogs in `src/lib/i18n/passkey-settings/<locale>.ts`, each one an explicit key object that `satisfies` the shared type, so a missing or renamed key fails typecheck instead of shifting a positional value.

`src/lib/i18n.ts` exports the frozen `zdpAuthMessages` aggregate, and `src/lib/passkey-settings-messages.ts` assembles its catalog internally; both expose the existing synchronous lookup APIs and freeze each catalog once at module initialization. The locale modules stay plain reusable objects, and those frozen catalogs share the same objects instead of copying them.

The planned locales now carry `productLink` and the provider passkey label in their own language. That copy is translated but not yet human-reviewed, and this work activates no feature gate and no locale: generated locale entrypoint shapes and public exports stay unchanged, while a rebuilt locale entry contains the translated copy. Those locales stay planned until the review above is complete.
