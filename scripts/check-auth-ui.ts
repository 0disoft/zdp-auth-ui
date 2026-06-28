import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { compile, type Warning } from 'svelte/compiler';

interface PackageJson {
  readonly version?: string;
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly peerDependencies?: Record<string, string>;
  readonly exports?: Record<string, unknown>;
  readonly files?: readonly string[];
  readonly scripts?: Record<string, string>;
  readonly sideEffects?: readonly string[];
}

const root = process.cwd();
const failures: string[] = [];
const expectedLocales = ['en', 'es', 'zh', 'hi', 'ko', 'fr', 'ja', 'de', 'pt', 'id'] as const;
const activeLocales = ['ko', 'en'] as const;
const plannedLocales = ['es', 'zh', 'hi', 'fr', 'ja', 'de', 'pt', 'id'] as const;
const componentPaths = [
  'src/lib/components/AuthShell.svelte',
  'src/lib/components/PasswordField.svelte',
  'src/lib/components/ProviderButton.svelte'
] as const;
const sourceBoundaryExtensions = new Set(['.svelte', '.ts']);
const forbiddenSourceBoundaryTexts = ['fetch(', 'localStorage', 'sessionStorage', 'document.cookie'] as const;
const componentDesignSystemImports: Record<string, readonly string[]> = {
  'src/lib/components/ProviderButton.svelte': ['Button'],
  'src/lib/components/PasswordField.svelte': [
    'ErrorText',
    'Field',
    'HelpText',
    'IconButton',
    'Input',
    'Label'
  ],
  'src/lib/components/AuthShell.svelte': ['Button', 'Divider', 'Inline', 'Link', 'Stack', 'Surface']
} as const;
const rawColorPattern = /#(?:[0-9a-fA-F]{3,8})\b|rgb[a]?\(|hsl[a]?\(|oklch\(/;
const requiredFiles = [
  'AGENTS.md',
  'BOUNDARY.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'README.md',
  'RUNBOOK.md',
  'SECURITY.md',
  'service.yaml',
  '.github/workflows/ci.yml',
  'vite.config.ts',
  'src/lib/auth-contract.ts',
  'src/lib/i18n.ts',
  'src/lib/index.ts',
  'src/lib/passkey.ts',
  'src/styles/index.css'
] as const;

const [
  packageSource,
  changelog,
  readme,
  runbook,
  service,
  ciWorkflow,
  i18nSource,
  publicEntry,
  passkeySource
] = await Promise.all([
  readFile(join(root, 'package.json'), 'utf8'),
  readFile(join(root, 'CHANGELOG.md'), 'utf8'),
  readFile(join(root, 'README.md'), 'utf8'),
  readFile(join(root, 'RUNBOOK.md'), 'utf8'),
  readFile(join(root, 'service.yaml'), 'utf8'),
  readFile(join(root, '.github', 'workflows', 'ci.yml'), 'utf8'),
  readFile(join(root, 'src', 'lib', 'i18n.ts'), 'utf8'),
  readFile(join(root, 'src', 'lib', 'index.ts'), 'utf8'),
  readFile(join(root, 'src', 'lib', 'passkey.ts'), 'utf8')
]);
const packageJson = JSON.parse(packageSource) as PackageJson;
const sourceFiles = await readSourceFiles(join(root, 'src', 'lib'));

checkRequiredFiles();
checkPackageJson(packageJson, changelog);
checkLocaleContract(readme, i18nSource);
checkMessageCatalog(i18nSource);
checkServiceBoundary(service);
checkCiWorkflow(ciWorkflow);
checkRunbook(runbook);
checkPublicEntry(publicEntry);
checkPasskeyBoundary(passkeySource);
checkSourceBoundary(sourceFiles);
await checkSvelteCompilation();

if (failures.length > 0) {
  throw new Error(`zdp-auth-ui check failed:\n- ${failures.join('\n- ')}`);
}

function checkRequiredFiles(): void {
  for (const relativePath of requiredFiles) {
    if (!existsSync(join(root, relativePath))) {
      failures.push(`Missing required file ${relativePath}.`);
    }
  }
}

function checkPackageJson(packageJson: PackageJson, changelog: string): void {
  if (!packageJson.version || !/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
    failures.push('package.json version must be an explicit semver value.');
  }

  if (packageJson.version && !changelog.includes(`## ${packageJson.version}`)) {
    failures.push(`CHANGELOG.md must include the current package version ${packageJson.version}.`);
  }

  if (packageJson.dependencies?.['zdp-design-system'] !== 'file:../zdp-design-system') {
    failures.push('zdp-auth-ui must consume zdp-design-system through the public sibling package.');
  }

  if (!packageJson.dependencies?.['@simplewebauthn/browser']) {
    failures.push('zdp-auth-ui must declare @simplewebauthn/browser for passkey browser ceremony helpers.');
  }

  for (const forbiddenDependency of ['better-auth', 'drizzle-orm', '@libsql/client']) {
    if (packageJson.dependencies?.[forbiddenDependency] || packageJson.devDependencies?.[forbiddenDependency]) {
      failures.push(`Forbidden auth authority or datastore dependency present: ${forbiddenDependency}.`);
    }
  }

  if (packageJson.peerDependencies?.svelte !== '^5.0.0') {
    failures.push('Svelte must stay a peer dependency for Astro/SvelteKit/Tauri consumers.');
  }

  if (packageJson.scripts?.check !== 'bun scripts/check-auth-ui.ts') {
    failures.push('package.json scripts.check must run scripts/check-auth-ui.ts.');
  }

  if (packageJson.scripts?.build !== 'vite build') {
    failures.push('package.json scripts.build must run vite build.');
  }

  for (const exportPath of ['.', './styles.css', './i18n', './contract']) {
    if (!packageJson.exports?.[exportPath]) {
      failures.push(`package.json must export ${exportPath}.`);
    }
  }

  if (!packageJson.sideEffects?.includes('./src/styles/index.css')) {
    failures.push('package.json sideEffects must preserve ./src/styles/index.css.');
  }
}

function checkLocaleContract(readme: string, i18nSource: string): void {
  for (const locale of expectedLocales) {
    if (!i18nSource.includes(`'${locale}'`)) {
      failures.push(`src/lib/i18n.ts is missing target locale ${locale}.`);
    }

    if (!readme.includes(locale)) {
      failures.push(`README.md is missing locale ${locale}.`);
    }
  }

  for (const locale of activeLocales) {
    if (!i18nSource.includes(`${locale}: {`)) {
      failures.push(`Active locale ${locale} must have a message catalog.`);
    }
  }

  for (const locale of plannedLocales) {
    if (!i18nSource.includes(`zdpAuthPlannedLocales =`) || !i18nSource.includes(`'${locale}'`)) {
      failures.push(`Planned locale ${locale} must stay visible in zdpAuthPlannedLocales.`);
    }
  }
}

function checkMessageCatalog(i18nSource: string): void {
  for (const requiredText of [
    'readonly brand: string;',
    'readonly groupLabel: string;',
    'readonly navigation: {',
    'readonly accountHelp: string;',
    "brand: '8ailors'",
    "groupLabel: '인증 수단 선택'",
    "groupLabel: 'Choose sign-in method'",
    "accountHelp: '계정 도움말'",
    "accountHelp: 'Account help'"
  ]) {
    if (!i18nSource.includes(requiredText)) {
      failures.push(`src/lib/i18n.ts must keep auth shell message key: ${requiredText}.`);
    }
  }
}

function checkServiceBoundary(service: string): void {
  for (const requiredText of [
    'id: auth-ui',
    'repo: zdp-auth-ui',
    'risk_level: medium',
    'pii_level: medium',
    'auth_required: false',
    'core-api',
    'client-sdks',
    'design-system',
    'no token, password, provider secret, passkey challenge, authorization header'
  ]) {
    if (!service.includes(requiredText)) {
      failures.push(`service.yaml must include boundary text: ${requiredText}.`);
    }
  }
}

function checkCiWorkflow(ciWorkflow: string): void {
  for (const requiredText of [
    'actions/checkout@v7',
    'Checkout auth UI',
    'Checkout design system',
    '0disoft/zdp-design-system',
    'secrets.ZDP_CI_READ_TOKEN || github.token',
    'projects/zdp-platforms/client-surfaces/zdp-auth-ui',
    'projects/zdp-platforms/client-surfaces/zdp-design-system',
    'oven-sh/setup-bun@v2',
    'Install design system dependencies',
    'Build design system package surface',
    'working-directory: projects/zdp-platforms/client-surfaces/zdp-design-system',
    'bun install --frozen-lockfile',
    'bun run package:build',
    'bun run check',
    'bun run build'
  ]) {
    if (!ciWorkflow.includes(requiredText)) {
      failures.push(`.github/workflows/ci.yml must include auth UI CI contract: ${requiredText}.`);
    }
  }
}

function checkRunbook(runbook: string): void {
  for (const requiredText of [
    'ZDP_CI_READ_TOKEN',
    'zdp-design-system',
    'bun run check',
    'bun run build'
  ]) {
    if (!runbook.includes(requiredText)) {
      failures.push(`RUNBOOK.md must include auth UI CI operation text: ${requiredText}.`);
    }
  }
}

function checkPublicEntry(publicEntry: string): void {
  for (const requiredText of [
    'export { default as AuthShell }',
    'export { default as PasswordField }',
    'export { default as ProviderButton }',
    'zdpAuthTargetLocales',
    'zdpAuthActiveLocales',
    'zdpAuthPlannedLocales',
    'startPasskeyAuthentication',
    'startPasskeyRegistration'
  ]) {
    if (!publicEntry.includes(requiredText)) {
      failures.push(`src/lib/index.ts is missing public export ${requiredText}.`);
    }
  }
}

function checkPasskeyBoundary(passkeySource: string): void {
  for (const requiredText of ['startAuthentication', 'startRegistration', '@simplewebauthn/browser']) {
    if (!passkeySource.includes(requiredText)) {
      failures.push(`src/lib/passkey.ts must keep browser passkey helper ${requiredText}.`);
    }
  }

  for (const forbiddenText of forbiddenSourceBoundaryTexts) {
    if (passkeySource.includes(forbiddenText)) {
      failures.push(`src/lib/passkey.ts must not own runtime auth storage or server calls: ${forbiddenText}.`);
    }
  }
}

function checkSourceBoundary(sourceFiles: readonly SourceFile[]): void {
  for (const sourceFile of sourceFiles) {
    for (const forbiddenText of forbiddenSourceBoundaryTexts) {
      if (sourceFile.source.includes(forbiddenText)) {
        failures.push(`${sourceFile.relativePath} must not own runtime auth storage or server calls: ${forbiddenText}.`);
      }
    }
  }

  const authShell = sourceFiles.find((sourceFile) => sourceFile.relativePath === 'src/lib/components/AuthShell.svelte');
  if (!authShell) {
    failures.push('src/lib/components/AuthShell.svelte must be included in source boundary checks.');
    return;
  }

  for (const requiredText of [
    'event.preventDefault();',
    "export let method: 'post' = 'post';",
    'method={formMethod}',
    'aria-label={messages.providers.groupLabel}',
    'aria-label={messages.navigation.accountHelp}',
    '{messages.brand}'
  ]) {
    if (!authShell.source.includes(requiredText)) {
      failures.push(`src/lib/components/AuthShell.svelte must keep auth boundary guard: ${requiredText}.`);
    }
  }

  if (authShell.source.includes("'get' | 'post'")) {
    failures.push("src/lib/components/AuthShell.svelte must not expose GET form submission.");
  }

  checkDesignSystemConsumption(sourceFiles);
  checkRawColorUsage(sourceFiles);
}

function checkDesignSystemConsumption(sourceFiles: readonly SourceFile[]): void {
  for (const [relativePath, expectedImports] of Object.entries(componentDesignSystemImports)) {
    const sourceFile = sourceFiles.find((file) => file.relativePath === relativePath);
    if (!sourceFile) {
      failures.push(`${relativePath} must be included in design-system consumption checks.`);
      continue;
    }

    const designSystemImports = getDesignSystemImportNames(sourceFile.source);
    if (designSystemImports.size === 0) {
      failures.push(`${relativePath} must consume zdp-design-system public exports.`);
      continue;
    }

    for (const expectedImport of expectedImports) {
      if (!designSystemImports.has(expectedImport)) {
        failures.push(`${relativePath} must use design-system export ${expectedImport}.`);
      }
    }
  }
}

function getDesignSystemImportNames(source: string): Set<string> {
  const importNames = new Set<string>();
  const importPattern = /import\s*{([\s\S]*?)}\s*from\s+['"]zdp-design-system['"];?/g;
  let match: RegExpExecArray | null;

  while ((match = importPattern.exec(source))) {
    for (const rawSpecifier of match[1].split(',')) {
      const specifier = rawSpecifier.trim();
      if (!specifier) {
        continue;
      }

      importNames.add(specifier.split(/\s+as\s+/)[0].trim());
    }
  }

  return importNames;
}

function checkRawColorUsage(sourceFiles: readonly SourceFile[]): void {
  for (const sourceFile of sourceFiles) {
    if (!componentPaths.includes(sourceFile.relativePath as (typeof componentPaths)[number])) {
      continue;
    }

    if (rawColorPattern.test(sourceFile.source)) {
      failures.push(`${sourceFile.relativePath} must use design-system color tokens, not raw hex/rgb/hsl/oklch literals.`);
    }
  }
}

async function checkSvelteCompilation(): Promise<void> {
  for (const relativePath of componentPaths) {
    const source = await readFile(join(root, relativePath), 'utf8');
    const warnings: Warning[] = [];

    compile(source, {
      css: 'external',
      dev: true,
      filename: relativePath,
      generate: 'client',
      warningFilter(warning) {
        warnings.push(warning);
        return false;
      }
    });

    if (warnings.length > 0) {
      failures.push(`${relativePath} has Svelte warnings: ${warnings.map((warning) => warning.message).join('; ')}`);
    }
  }
}

interface SourceFile {
  readonly relativePath: string;
  readonly source: string;
}

async function readSourceFiles(directory: string): Promise<SourceFile[]> {
  const relativePaths = await listSourceFilePaths(directory);
  return Promise.all(
    relativePaths.map(async (relativePath) => ({
      relativePath,
      source: await readFile(join(root, relativePath), 'utf8')
    }))
  );
}

async function listSourceFilePaths(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        return listSourceFilePaths(fullPath);
      }

      if (!entry.isFile() || !sourceBoundaryExtensions.has(extname(entry.name))) {
        return [];
      }

      return [relative(root, fullPath).replaceAll('\\', '/')];
    })
  );

  return paths.flat().sort();
}
