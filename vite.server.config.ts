import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

const externalPackageRoots = new Set([
  '@simplewebauthn/browser',
  'svelte'
]);

function isExternalPackage(id: string): boolean {
  const packageRoot = id.startsWith('@')
    ? id.split('/').slice(0, 2).join('/')
    : id.split('/')[0] ?? id;

  return externalPackageRoots.has(packageRoot);
}

export default defineConfig({
  plugins: [svelte()],
  ssr: {
    noExternal: ['zdp-design-system']
  },
  build: {
    ssr: true,
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: 'src/lib/index.ts',
        components: 'src/lib/components.ts'
      },
      external: isExternalPackage,
      output: {
        entryFileNames: '[name].server.js',
        chunkFileNames: '[name]-[hash].server.js'
      }
    }
  }
});
