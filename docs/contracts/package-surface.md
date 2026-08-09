# Package Surface Contract

The package surface is the root export, `./styles.css`, `./i18n`, and `./contract`.

`package.json` export entries must resolve to `dist/**`. The root export selects `dist/index.js` for browser builds and `dist/index.server.js` for Node SSR builds. The SSR build compiles the design-system Svelte source while keeping the consuming application's Svelte runtime external. Consumers must not deep import `src/**`. The clean consumer fixture proves package-root imports, message-keyed provider labels, password field overrides, callback wiring, and disabled-by-default product-link consumption without compiling source files from this repository.

When packaged files, export entries, build scripts, examples, or package metadata change, evaluate package version impact and verify with the package build, check, and pack dry-run intents.
