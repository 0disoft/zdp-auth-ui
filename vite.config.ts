import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, type Plugin } from 'vite';
import { zdpAuthTargetLocales, type ZdpAuthLocale } from './src/lib/i18n/schema.ts';

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
 * purpose: Emit public declarations for the independently built source locale entries.
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
          fileName: `i18n/${locale}.d.ts`,
          source: renderLocaleDeclaration(locale)
        });
      }

      this.emitFile({
        type: 'asset',
        fileName: 'i18n/loader.d.ts',
        source: localeLoaderDeclaration
      });
    }
  };
}

function renderLocaleDeclaration(locale: ZdpAuthLocale): string {
  return [
    "import type { ZdpAuthMessages } from '../svelte/i18n.js';",
    "import type { ZdpPasskeySettingsMessages } from '../svelte/passkey-settings-messages.js';",
    '',
    `export declare const locale: ${JSON.stringify(locale)};`,
    'export declare const messages: ZdpAuthMessages;',
    'export declare const passkeySettingsMessages: ZdpPasskeySettingsMessages;',
    'export default messages;',
    ''
  ].join('\n');
}

const localeLoaderDeclaration = `import type { ZdpAuthLocale, ZdpAuthMessages } from '../svelte/i18n.js';
import type { ZdpPasskeySettingsMessages } from '../svelte/passkey-settings-messages.js';

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
        contract: 'src/lib/auth-contract.ts',
        'i18n/loader': 'src/lib/i18n/loader.ts',
        ...Object.fromEntries(zdpAuthTargetLocales.map(locale => [
          `i18n/${locale}`, `src/lib/i18n/${locale}.ts`
        ]))
      },
      formats: ['es'],
      fileName: (_format: string, entryName: string) => `${entryName}.js`
    },
    rollupOptions: {
      external: isExternalPackage
    }
  }
});
