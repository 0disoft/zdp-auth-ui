# Package Surface Contract

The package surface is the root export, `./styles.css`, `./i18n`, and `./contract`.

`package.json` export entries must resolve to `dist/**`. Consumers must not deep import `src/**`. The clean consumer fixture proves package-root imports, message-keyed provider labels, password field overrides, and callback wiring without compiling source files from this repository.

When packaged files, export entries, build scripts, examples, or package metadata change, evaluate package version impact and verify with the package build, check, and pack dry-run intents.
