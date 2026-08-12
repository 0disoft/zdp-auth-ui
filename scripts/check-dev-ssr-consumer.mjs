import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const parentSource = `
<script>
  import { AuthShell } from './dist/index.server.js';
</script>
<AuthShell locale="ko" mode="login" availability="preparing">
  <div>slot content</div>
</AuthShell>
`;

const { js } = compile(parentSource, {
  generate: 'server',
  filename: 'DevParent.svelte',
  dev: true
});

const repoRoot = fileURLToPath(new URL('..', import.meta.url)).replaceAll('\\', '/');
const dir = join(repoRoot, 'scripts', '.repro-tmp');
mkdirSync(dir, { recursive: true });
const modulePath = join(dir, 'DevParent.mjs');
const rewritten = js.code.replace(
  `from './dist/index.server.js'`,
  `from ${JSON.stringify(repoRoot + 'dist/index.server.js')}`
);
writeFileSync(modulePath, rewritten);
const parentMod = await import(modulePath);

try {
  const { body } = render(parentMod.default, {});
  console.log('RENDER OK, body length:', body.length);
} catch (error) {
  console.error('RENDER CRASH:', error.message);
  console.error(error.stack?.split('\n').slice(0, 8).join('\n'));
  process.exitCode = 1;
}

rmSync(dir, { recursive: true, force: true });
