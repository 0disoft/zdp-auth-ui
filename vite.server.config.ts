import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

const externalPackageRoots = new Set([
  '@simplewebauthn/browser',
  'svelte'
]);

function isExternalPackage(id: string): boolean {
  const packageRoot = id.startsWith('@')
    ? id.split('/').slice(0, 2).join('/')
    : id.split('/')[0];

  return externalPackageRoots.has(packageRoot);
}

export default defineConfig({
  plugins: [svelte()],
  ssr: {
    noExternal: ['zdp-design-system']
  },
  build: {
    ssr: 'src/lib/index.ts',
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      external: isExternalPackage,
      output: {
        entryFileNames: 'index.server.js'
      }
    }
  }
});
