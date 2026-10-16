import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');

async function writeStylesEntry(): Promise<void> {
  const sourceStyles = await readFile(join(root, 'src', 'styles', 'index.css'), 'utf8');
  const componentStyles =
    (await readOptionalFile(join(distDir, 'index.css'))) ||
    (await readOptionalFile(join(distDir, 'zdp-auth-ui.css')));
  const styles = componentStyles.trim()
    ? `${sourceStyles.trimEnd()}\n\n${componentStyles.trimStart()}`
    : sourceStyles;

  await writeFile(join(distDir, 'styles.css'), `${styles.trimEnd()}\n`, 'utf8');
}

async function readOptionalFile(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return '';
    }

    throw error;
  }
}

await mkdir(distDir, { recursive: true });
await writeStylesEntry();
