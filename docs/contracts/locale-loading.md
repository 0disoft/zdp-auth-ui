# Locale Loading Contract

Locale catalogs stay isolated from the component entry, so a consumer pays for one locale instead of all twelve.

## Fixed locale import

Consumers that know the locale at build time import one catalog directly.

```ts
import koMessages, { locale, messages, passkeySettingsMessages } from 'zdp-auth-ui/i18n/ko';
```

Every target locale has the same module shape: a literal `locale`, a named `messages` value, a named `passkeySettingsMessages` value for the passkey management surface, and `messages` as the default export.

## Runtime locale import

Consumers that choose locale at runtime use the loader subpath.

```ts
import { loadAuthLocale } from 'zdp-auth-ui/i18n/loader';

export async function loadCatalog(requestedLocale: string) {
  const { locale, messages, passkeySettingsMessages } = await loadAuthLocale(requestedLocale);
  return { locale, messages, passkeySettingsMessages };
}
```

`loadAuthLocale()` dynamically imports one generated locale module and returns `{ locale, messages, passkeySettingsMessages }` from that single import. `loadAuthMessages(locale)` remains available and returns `messages`; `loadPasskeySettingsMessages(locale)` returns `passkeySettingsMessages`. A value outside `zdpAuthTargetLocales` loads English.

Call `loadCatalog()` from the application's route load or async bootstrap. Consumers await the catalog before rendering and pass its values as component props. This applies to SSR and client rendering; components never load messages asynchronously themselves.

The loader does not call `fetch`, inspect authentication state, use browser storage, choose a remote URL, or navigate.

## Initial bundle

Catalogs are generated from a synchronous source, so any component that falls back to its built-in catalog keeps that catalog in the initial bundle.

- Passing only `messages` to a root component keeps the synchronous catalog import, so the bundle does not shrink.
- `zdp-auth-ui/components` with `loadAuthLocale` keeps every catalog out of the initial bundle; the selected locale arrives as a separate lazy chunk.
- `zdp-auth-ui/components` with a fixed `zdp-auth-ui/i18n/<locale>` import includes that one locale's data in the initial bundle and leaves the other eleven catalogs out.
- Root utilities such as `createZdpAuthSurfaceModel` and `getAuthMessages` stay synchronous, so using them pulls the whole auth catalog in.

## Compatibility

`zdp-auth-ui/i18n` and package-root message exports remain synchronous compatibility surfaces and continue to expose all 12 catalogs. New consumers should use a fixed locale entry or the loader when initial JavaScript size matters.

## Source of truth

Auth copy is authored in `src/lib/i18n/auth/<locale>.ts` and passkey management copy in `src/lib/i18n/passkey-settings/<locale>.ts`, both against the shared types in `src/lib/i18n/schema.ts`. `src/lib/i18n.ts` exports the frozen `zdpAuthMessages` aggregate and `src/lib/passkey-settings-messages.ts` assembles its catalog internally; both freeze each catalog once at module initialization. The browser Vite build serializes each catalog member into `dist/i18n/<locale>.js`, emits the matching declaration, and writes the dynamic loader, so a rebuilt entry carries the current translated copy. No copied locale catalog is maintained in source, and the generated entries cannot drift into a second hand-maintained catalog; the locale loading and public import shapes above are unchanged.

## Brand placeholders

A `summary` in `src/lib/i18n/auth/<locale>.ts` that names the account brand carries the `{brand}` placeholder instead of a literal `8ailors`, while summaries without a brand, such as the English signup copy, stay unchanged; a consumer that renders a catalog summary without the UI component substitutes the placeholder itself. `AuthShell` fills every token from the normalized `accountBrand`, falling back to `catalog.brand`, through a `replaceAll` callback so tokens land literally (`$&` and `$$` survive), and `PasswordSignupFields` uses the same callback form for `{minimumAge}`.
