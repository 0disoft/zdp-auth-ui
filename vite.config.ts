import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, type Plugin } from 'vite';
import { getPasskeySettingsMessages } from './src/lib/passkey-settings-messages.ts';
import {
  zdpAuthMessages,
  zdpAuthTargetLocales,
  type ZdpAuthLocale,
  type ZdpAuthMessages
} from './src/lib/i18n.ts';

const externalPackageRoots = new Set([
  '@simplewebauthn/browser',
  'svelte',
  'zdp-design-system'
]);

function isExternalPackage(id: string): boolean {
  const packageRoot = id.startsWith('@')
    ? id.split('/').slice(0, 2).join('/')
    : id.split('/')[0] ?? id;

  return externalPackageRoots.has(packageRoot);
}

/*
 * mf:anchor zdp.auth-ui.locale-package-entries
 * purpose: Generate independently importable locale catalogs and the lazy loader from the synchronous message SSOT.
 * search: locale subpath, lazy auth messages, loadAuthMessages, generated catalog
 * invariant: Generated modules contain message data only and never select a remote URL or own authentication state.
 * risk: config
 */
function authLocaleEntries(): Plugin {
  return {
    name: 'zdp-auth-ui-locale-entries',
    apply: 'build',
    buildStart() {
      for (const locale of zdpAuthTargetLocales) {
        this.emitFile({
          type: 'asset',
          fileName: `i18n/${locale}.js`,
          source: renderLocaleModule(locale, zdpAuthMessages[locale])
        });
        this.emitFile({
          type: 'asset',
          fileName: `i18n/${locale}.d.ts`,
          source: renderLocaleDeclaration(locale)
        });
      }

      this.emitFile({
        type: 'asset',
        fileName: 'i18n/loader.js',
        source: renderLocaleLoader()
      });
      this.emitFile({
        type: 'asset',
        fileName: 'i18n/loader.d.ts',
        source: localeLoaderDeclaration
      });
    }
  };
}

function renderLocaleModule(locale: ZdpAuthLocale, messages: ZdpAuthMessages): string {
  return [
    `export const locale = ${JSON.stringify(locale)};`,
    `export const messages = ${serializeJavaScript(messages)};`,
    `export const passkeySettingsMessages = ${serializeJavaScript(getPasskeySettingsMessages(locale))};`,
    'function freezeMessages(value) {',
    '  for (const child of Object.values(value)) {',
    "    if (child !== null && typeof child === 'object' && !Object.isFrozen(child)) freezeMessages(child);",
    '  }',
    '  Object.freeze(value);',
    '}',
    'freezeMessages(messages);',
    'freezeMessages(passkeySettingsMessages);',
    'export default messages;',
    ''
  ].join('\n');
}

function renderLocaleDeclaration(locale: ZdpAuthLocale): string {
  return [
    "import type { ZdpAuthMessages } from '../i18n';",
    "import type { ZdpPasskeySettingsMessages } from '../types/passkey-settings-messages';",
    '',
    `export declare const locale: ${JSON.stringify(locale)};`,
    'export declare const messages: ZdpAuthMessages;',
    'export declare const passkeySettingsMessages: ZdpPasskeySettingsMessages;',
    'export default messages;',
    ''
  ].join('\n');
}

function renderLocaleLoader(): string {
  const loaders = zdpAuthTargetLocales
    .map((locale) => `  ${JSON.stringify(locale)}: () => import('./${locale}.js')`)
    .join(',\n');

  return [
    'const localeLoaders = {',
    loaders,
    '};',
    '',
    'export async function loadAuthLocale(locale) {',
    "  const selectedLocale = typeof locale === 'string' && Object.hasOwn(localeLoaders, locale)",
    "    ? locale",
    "    : 'en';",
    '  return localeLoaders[selectedLocale]();',
    '}',
    '',
    'export async function loadAuthMessages(locale) {',
    '  return (await loadAuthLocale(locale)).messages;',
    '}',
    '',
    'export async function loadPasskeySettingsMessages(locale) {',
    '  return (await loadAuthLocale(locale)).passkeySettingsMessages;',
    '}',
    ''
  ].join('\n');
}

function serializeJavaScript(value: object): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new TypeError('Auth locale messages must be JSON serializable.');
  }

  return serialized
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

const localeLoaderDeclaration = `import type { ZdpAuthLocale, ZdpAuthMessages } from '../i18n';
import type { ZdpPasskeySettingsMessages } from '../types/passkey-settings-messages';

export declare function loadAuthLocale(locale: ZdpAuthLocale | string): Promise<{
  readonly locale: ZdpAuthLocale;
  readonly messages: ZdpAuthMessages;
  readonly passkeySettingsMessages: ZdpPasskeySettingsMessages;
}>;

export declare function loadPasskeySettingsMessages(locale: ZdpAuthLocale | string): Promise<ZdpPasskeySettingsMessages>;

export declare function loadAuthMessages(
  locale: ZdpAuthLocale | string
): Promise<ZdpAuthMessages>;
`;

export default defineConfig({
  plugins: [svelte(), authLocaleEntries()],
  build: {
    lib: {
      entry: {
        index: 'src/lib/index.ts',
        components: 'src/lib/components.ts',
        i18n: 'src/lib/i18n.ts',
        contract: 'src/lib/auth-contract.ts'
      },
      formats: ['es'],
      fileName: (_format: string, entryName: string) => `${entryName}.js`
    },
    rollupOptions: {
      external: isExternalPackage
    }
  }
});
