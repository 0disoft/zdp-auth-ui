import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

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

export default defineConfig({
  plugins: [svelte()],
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
