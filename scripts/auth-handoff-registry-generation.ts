import { readFile, writeFile } from 'node:fs/promises';

import { join, relative } from 'node:path';

interface AuthHandoffRegistryProduct {
  readonly id: string;
  readonly returnPaths: readonly string[];
}

interface AuthHandoffRegistryManifest {
  readonly schemaVersion: 1;
  readonly products: readonly AuthHandoffRegistryProduct[];
}

interface GeneratedTarget {
  readonly path: string;
  readonly content: string;
}

const manifestRelativePath = 'config/auth-handoff-registry.json';

const generatedSourceRelativePath = 'src/lib/auth-handoff-registry.generated.ts';

const productIdPattern = /^[a-z][a-z0-9-]{0,63}$/u;

const returnPathPattern = /^\/[A-Za-z0-9/_-]*$/u;

const maximumProducts = 128;

const maximumReturnPathsPerProduct = 64;

const maximumReturnPathLength = 160;

const maximumQueryLength = 256;

export async function generateAuthHandoffRegistryFiles(root = process.cwd()): Promise<readonly string[]> {
  const targets = await buildGeneratedTargets(root);
  const changedPaths: string[] = [];

  for (const target of targets) {
    const current = await readOptionalFile(target.path);
    if (current === target.content) {
      continue;
    }

    await writeFile(target.path, target.content, 'utf8');
    changedPaths.push(relative(root, target.path).replaceAll('\\', '/'));
  }

  return changedPaths;
}

export async function checkAuthHandoffRegistryGeneratedFiles(root = process.cwd()): Promise<void> {
  const targets = await buildGeneratedTargets(root);
  const stalePaths: string[] = [];

  for (const target of targets) {
    const current = await readOptionalFile(target.path);
    if (current !== target.content) {
      stalePaths.push(relative(root, target.path).replaceAll('\\', '/'));
    }
  }

  if (stalePaths.length > 0) {
    throw new Error(
      `Auth handoff registry generated files are stale: ${stalePaths.join(', ')}. Run bun run auth-handoff:generate.`
    );
  }
}

async function buildGeneratedTargets(root: string): Promise<readonly GeneratedTarget[]> {
  const manifestPath = join(root, manifestRelativePath);
  const manifestSource = await readFile(manifestPath, 'utf8');
  const manifest = parseManifest(manifestSource);

  return [
    {
      path: join(root, generatedSourceRelativePath),
      content: renderGeneratedSource(manifest)
    }
  ];
}

function parseManifest(source: string): AuthHandoffRegistryManifest {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (error) {
    throw new Error(`Invalid JSON in ${manifestRelativePath}.`, { cause: error });
  }

  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.products)) {
    throw new Error(`${manifestRelativePath} must use schemaVersion 1 and contain a products array.`);
  }

  if (value.products.length === 0 || value.products.length > maximumProducts) {
    throw new Error(`${manifestRelativePath} must contain between 1 and ${maximumProducts} products.`);
  }

  assertExactKeys(value, ['schemaVersion', 'products'], manifestRelativePath);
  const products = value.products.map((product, index) => parseProduct(product, index));
  assertUnique(products.map((product) => product.id), 'product id');
  assertSorted(products.map((product) => product.id), 'product ids');

  return { schemaVersion: 1, products };
}

function parseProduct(value: unknown, index: number): AuthHandoffRegistryProduct {
  if (!isRecord(value)) {
    throw new Error(`products[${index}] must be an object.`);
  }

  assertExactKeys(value, ['id', 'returnPaths'], `products[${index}]`);
  const { id, returnPaths } = value;
  if (typeof id !== 'string' || !productIdPattern.test(id)) {
    throw new Error(`products[${index}].id must match ${productIdPattern.source}.`);
  }

  if (
    !Array.isArray(returnPaths)
    || returnPaths.length === 0
    || returnPaths.length > maximumReturnPathsPerProduct
  ) {
    throw new Error(
      `products[${index}].returnPaths must contain between 1 and ${maximumReturnPathsPerProduct} paths.`
    );
  }

  const validatedReturnPaths = returnPaths.map((returnPath, pathIndex) => {
    if (
      typeof returnPath !== 'string'
      || returnPath.length > maximumReturnPathLength
      || !returnPathPattern.test(returnPath)
      || returnPath.startsWith('//')
      || returnPath.split('/').some((segment) => segment === '.' || segment === '..')
    ) {
      throw new Error(`products[${index}].returnPaths[${pathIndex}] is not a canonical relative path.`);
    }

    return returnPath;
  });

  for (const returnPath of validatedReturnPaths) {
    const query = new URLSearchParams([
      ['product_id', id],
      ['return_path', returnPath]
    ]).toString();
    if (query.length > maximumQueryLength) {
      throw new Error(
        `Product ${id} and return path ${returnPath} exceed the ${maximumQueryLength}-character query bound.`
      );
    }
  }

  assertUnique(validatedReturnPaths, `return path for product ${id}`);
  assertSorted(validatedReturnPaths, `return paths for product ${id}`);
  return { id, returnPaths: validatedReturnPaths };
}

function renderGeneratedSource(manifest: AuthHandoffRegistryManifest): string {
  const productIds = manifest.products.map((product) => quoteSource(product.id)).join(', ');
  const registryEntries = manifest.products
    .map((product) => {
      const returnPaths = product.returnPaths.map(quoteSource).join(', ');
      return `  ${formatSourcePropertyKey(product.id)}: Object.freeze([${returnPaths}] as const)`;
    })
    .join(',\n');

  return `// Generated from ${manifestRelativePath} by scripts/generate-auth-handoff-registry.ts.\n// Do not edit this file directly.\n\nexport const zdpAuthHandoffProductIds = Object.freeze([${productIds}] as const);\nexport type ZdpAuthHandoffProductId = (typeof zdpAuthHandoffProductIds)[number];\n\nexport const zdpAuthHandoffReturnPathRegistry = Object.freeze({\n${registryEntries}\n} satisfies Readonly<Record<ZdpAuthHandoffProductId, readonly string[]>>);\n`;
}

function assertExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
  label: string
): void {
  const actualKeys = Object.keys(value).sort(compareAscii);
  const sortedExpectedKeys = [...expectedKeys].sort(compareAscii);
  if (
    actualKeys.length !== sortedExpectedKeys.length
    || actualKeys.some((key, index) => key !== sortedExpectedKeys[index])
  ) {
    throw new Error(`${label} must contain only: ${sortedExpectedKeys.join(', ')}.`);
  }
}

function assertUnique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${manifestRelativePath} contains a duplicate ${label}.`);
  }
}

function assertSorted(values: readonly string[], label: string): void {
  const sorted = [...values].sort(compareAscii);
  if (values.some((value, index) => value !== sorted[index])) {
    throw new Error(`${manifestRelativePath} ${label} must be sorted lexicographically.`);
  }
}

function compareAscii(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function quoteSource(value: string): string {
  return `'${value}'`;
}

function formatSourcePropertyKey(value: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(value) ? value : quoteSource(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readOptionalFile(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && 'code' in value;
}
