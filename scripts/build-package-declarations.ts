import { createRequire } from 'node:module';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { emitDts } from 'svelte2tsx';

const components = ['AuthShell', 'LoginIdField', 'PasswordField', 'PasswordSignupFields', 'ProductLinkApproval', 'ProviderButton', 'PasskeySettings'];

export async function generatePackageDeclarations(root: string): Promise<void> {
  const require = createRequire(import.meta.url);
  await emitDts({ declarationDir: join(root, 'dist/types'), libRoot: join(root, 'src/lib'),
    svelteShimsPath: require.resolve('svelte2tsx/svelte-shims-v4.d.ts'), tsconfig: 'tsconfig.declarations.json' });
  const componentImports = components.map(name => `import ${name} from './types/components/${name}.svelte';`).join('\n');
  const props = components.map(name => `export type ${name}Props = ComponentProps<typeof ${name}>;`).join('\n');
  await Promise.all([
    writeFile(join(root, 'dist/index.d.ts'), `import type { ComponentProps } from 'svelte';\n${componentImports}\nexport * from './types/index';\n${props}\n`),
    writeFile(join(root, 'dist/contract.d.ts'), "export * from './types/auth-contract';\n"),
    writeFile(join(root, 'dist/i18n.d.ts'), "export * from './types/i18n';\n")
  ]);
}
