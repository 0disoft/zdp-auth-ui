import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: {
        index: 'src/lib/index.ts',
        i18n: 'src/lib/i18n.ts',
        contract: 'src/lib/auth-contract.ts'
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: ['@simplewebauthn/browser', 'svelte', 'zdp-design-system']
    }
  }
});
