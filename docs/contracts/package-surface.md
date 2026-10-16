# Package Surface Contract

The package exposes the root export, `./components`, `./styles.css`, `./i18n`, `./i18n/loader`, one explicit `./i18n/<locale>` entry for every value in `zdpAuthTargetLocales`, and `./contract`.

## Root export

The root exports `AuthShell`, `LoginIdField`, `PasswordField`, `PasswordSignupFields`, `ProductLinkApproval`, and `PasskeySettings` as compatibility adapters. Their `messages` props remain optional and fall back to synchronous `getAuthMessages()` or `getPasskeySettingsMessages()`. `PasskeySettings.authMessages` also remains optional and falls back to `getAuthMessages()`.

`PasswordSignupFields` reads `contract.locale` and has no independent `locale` prop or default. The other adapters default `locale` to `'en'`. `ProviderButton` remains a direct component export and takes no message props. The root also re-exports shared utilities, contracts, and the `<Name>Props` aliases.

## Components entry

`zdp-auth-ui/components` exports every UI component and its `<Name>Props = ComponentProps<typeof Name>` alias without the synchronous catalog runtime.

- `AuthShell`, `LoginIdField`, `PasswordField`, `PasswordSignupFields`, and `ProductLinkApproval` require `messages: ZdpAuthMessages`.
- `LoginIdField` also requires `id`, and `PasswordField` also requires `id` and `name`.
- `PasskeySettings` requires `messages: ZdpPasskeySettingsMessages` and `authMessages: ZdpAuthMessages`, the latter for its internal `PasswordField` visibility-toggle copy.
- `ProviderButton` takes no `messages` prop.
- `AuthShell` does not provide a message context, so a slotted `PasswordField` and any other slotted field need their own `messages`. `PasswordSignupFields` and `PasskeySettings` pass `messages` to the fields they own.

```svelte
<script lang="ts">
  import { AuthShell, LoginIdField, PasswordField } from 'zdp-auth-ui/components';
  import koMessages from 'zdp-auth-ui/i18n/ko';
</script>

<AuthShell locale="ko" messages={koMessages}>
  <LoginIdField id="login-id" locale="ko" messages={koMessages} />
  <PasswordField id="password" name="password" locale="ko" messages={koMessages} />
</AuthShell>
```

Components use only type imports from the catalog sources and do not import their runtime data or synchronous compatibility entries. With a fixed locale import, the initial bundle contains that selected locale's auth and passkey data. With the runtime loader, the initial bundle contains zero catalogs and the selected locale is loaded separately. Passing `messages` to root adapters retains their synchronous catalog imports and does not reduce the bundle.

## Locale entries

Each `./i18n/<locale>` entry exposes `locale`, `messages`, and `passkeySettingsMessages`, and re-exports `messages` as the default export. Locale entries must not expose identity, session, navigation, storage, or network behavior.

## Resolution and build

`package.json` JavaScript and declaration export entries must resolve to `dist/**`. The root export selects `dist/index.js` for browser builds and `dist/index.server.js` for Node SSR builds, while its `svelte` and `types` conditions resolve to `dist/svelte/index.js` and `dist/svelte/index.d.ts`. `svelte-package` compiles `src/lib/i18n/<locale>.ts` and `src/lib/i18n/loader.ts` into both `dist/svelte/i18n/<locale>.js` with its own `<locale>.d.ts` and the `loader.js`/`loader.d.ts` pair, and owns the component and shared TypeScript declarations under `dist/svelte/**`, including the synchronous `./i18n` aggregate and `./contract` types. The `./i18n/<locale>` and `./i18n/loader` import names stay unchanged while their `types`, `import`, and `default` targets point into `dist/svelte/i18n/**`; the root browser and Node SSR bundles, the `./i18n` aggregate at `dist/i18n.js`, the `./contract` bundle at `dist/contract.js`, and the existing `./styles.css` entry at `dist/styles.css` stay where they are. The build still runs the Vite browser and Node SSR bundles that produce those root JavaScript fallbacks before `svelte-package` writes `dist/svelte/**`, so the Vite bundle remains required alongside `svelte-package`. Consumers must not deep import `src/**`.

The `./components` entry selects `dist/components.js` for browser builds and `dist/components.server.js` for Node SSR builds, and `dist/svelte/components.js` with `dist/svelte/components.d.ts` for the `svelte` and `types` conditions.

Components and compatibility adapters are now authored with Svelte 5 runes, so the `svelte` condition ships packaged `.svelte` files that the consumer's own Svelte compiler builds. Declarations come from `svelte-package`; the manual declaration generator `scripts/build-package-declarations.ts` and the server component identity rewrite `scripts/preserve-server-component-identity.ts` are removed, and `svelte2tsx` is no longer a direct dependency although `svelte-package` still uses it internally.

The synchronous `./i18n` export remains compatible and contains all locale catalogs. Consumers that need one fixed catalog should import `zdp-auth-ui/i18n/<locale>`. Consumers that select locale at runtime should import `loadAuthLocale` from `zdp-auth-ui/i18n/loader`; unsupported values fall back to English.

Auth translation still has a single authoring place: `src/lib/i18n/auth/<locale>.ts` and `src/lib/i18n/passkey-settings/<locale>.ts` hold the explicit key objects, `src/lib/i18n/schema.ts` holds the shared readonly types and locale lists, and `src/lib/i18n.ts` and `src/lib/passkey-settings-messages.ts` stay the single assembly and freeze point behind the compatibility surfaces' synchronous APIs. The `src/lib/i18n/<locale>.ts` entries hold only type-annotated imports of that copy frozen with `freezeMessages`, and `src/lib/i18n/loader.ts` holds the static `import()` map checked with `satisfies`, so isolated entries cannot drift into a second manually maintained message catalog, and a rebuilt `dist/svelte/i18n/<locale>` entry carries the current translated copy.

The SSR build compiles the design-system Svelte source while keeping the consuming application's Svelte runtime external. The clean consumer fixture proves package-root imports, message-keyed provider labels, password field overrides, callback wiring, and disabled-by-default product-link consumption without compiling source files from this repository.

The new subpath and APIs are additive and have a minor version impact. Required message props apply only to the new `./components` entry; existing root props keep their optionality. Splitting the catalogs from positional arrays into explicit key objects preserves public exports and generated locale entrypoint shapes. This local work does not bump the version or publish the package.

When packaged files, export entries, build scripts, examples, package metadata, locale entrypoints, or declarations change, evaluate package version impact and verify with the package build, check, and pack dry-run intents.
