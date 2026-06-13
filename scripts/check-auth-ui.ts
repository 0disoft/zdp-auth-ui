import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
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

checkRequiredFiles();
checkPackageJson(packageJson, changelog);
checkLocaleContract(readme, i18nSource);
checkServiceBoundary(service);
checkCiWorkflow(ciWorkflow);
checkRunbook(runbook);
checkPublicEntry(publicEntry);
checkPasskeyBoundary(passkeySource);
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
    'actions/checkout@v6',
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

  for (const forbiddenText of ['fetch(', 'localStorage', 'sessionStorage', 'document.cookie']) {
    if (passkeySource.includes(forbiddenText)) {
      failures.push(`src/lib/passkey.ts must not own runtime auth storage or server calls: ${forbiddenText}.`);
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
