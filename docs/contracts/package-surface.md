# Package Surface Contract

The compatibility package surface is the root export, `./styles.css`, `./i18n`, and `./contract`.

The opt-in locale surface is `./i18n/loader` plus one explicit `./i18n/<locale>` entry for every value in `zdpAuthTargetLocales`. Locale entries expose only `locale`, `messages`, and the default message catalog. They must not expose identity, session, navigation, storage, or network behavior.

`package.json` JavaScript and declaration export entries must resolve to `dist/**`. The root export selects `dist/index.js` for browser builds and `dist/index.server.js` for Node SSR builds. The browser build generates locale JavaScript and declarations together under `dist/i18n/**`. Consumers must not deep import `src/**`.

The synchronous `./i18n` export remains compatible and contains all locale catalogs. Consumers that need one fixed catalog should import `zdp-auth-ui/i18n/<locale>`. Consumers that select locale at runtime should import `loadAuthMessages` from `zdp-auth-ui/i18n/loader`; unsupported values fall back to English.

`src/lib/i18n.ts` remains the only translation source. The browser build serializes each catalog and emits the lazy loader, so isolated entries cannot drift into a second manually maintained message catalog.

The SSR build compiles the design-system Svelte source while keeping the consuming application's Svelte runtime external. The clean consumer fixture proves package-root imports, message-keyed provider labels, password field overrides, callback wiring, and disabled-by-default product-link consumption without compiling source files from this repository.

When packaged files, export entries, build scripts, examples, package metadata, locale entrypoints, or declarations change, evaluate package version impact and verify with the package build, check, and pack dry-run intents.
