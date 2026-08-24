# Locale Loading Contract

## Fixed locale import

Consumers that know the locale at build time import one catalog directly.

```ts
import koMessages from 'zdp-auth-ui/i18n/ko';
```

Every target locale has the same module shape.

```ts
import { locale, messages } from 'zdp-auth-ui/i18n/en';
```

The module exports its literal `locale`, a named `messages` value, and the same value as the default export.

## Runtime locale import

Consumers that choose locale at runtime use the loader subpath.

```ts
import { loadAuthMessages } from 'zdp-auth-ui/i18n/loader';

const messages = await loadAuthMessages(requestedLocale);
```

`loadAuthMessages()` dynamically imports one generated package module. A value outside `zdpAuthTargetLocales` loads English. The loader does not call `fetch`, inspect authentication state, use browser storage, choose a remote URL, or navigate.

## Compatibility

`zdp-auth-ui/i18n` and package-root message exports remain synchronous compatibility surfaces and continue to expose all 12 catalogs. New consumers should use a fixed locale entry or the loader when initial JavaScript size matters.

## Source of truth

`src/lib/i18n.ts` remains the only translation source. The browser Vite build serializes each `zdpAuthMessages` member into `dist/i18n/<locale>.js`, emits the matching declaration, and writes the dynamic loader. No copied locale catalog is maintained in source.
