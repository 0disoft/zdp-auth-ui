import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile, type Warning } from 'svelte/compiler';
import {
  assertVersionSatisfiesCaretRange,
  readBunRegistryLockEntry
} from './bun-registry-lock';
import { getAuthMessages, zdpAuthMessages, zdpAuthTargetLocales } from '../src/lib/i18n';
import browserBuildConfig from '../vite.config';
import serverBuildConfig from '../vite.server.config';
import { findStyleTokenViolations } from './style-token-policy';

interface PackageJson {
  readonly name?: string;
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
const expectedLocales = ['en', 'zh', 'es', 'fr', 'hi', 'ko', 'ja', 'vi', 'ru', 'id', 'ms', 'th'] as const;
const componentPaths = [
  'src/lib/components/AuthShell.svelte',
  'src/lib/components/LoginIdField.svelte',
  'src/lib/components/PasswordField.svelte',
  'src/lib/components/PasswordSignupFields.svelte',
  'src/lib/components/ProductLinkApproval.svelte',
  'src/lib/components/ProviderButton.svelte',
  'src/lib/components/PasskeySettings.svelte'
] as const;
const exampleComponentPaths = [
  'examples/clean-consumer/AuthUiCleanConsumer.svelte'
] as const;
const sourceBoundaryExtensions = new Set(['.svelte', '.ts']);
const forbiddenSourceBoundaryTexts = ['fetch(', 'localStorage', 'sessionStorage', 'document.cookie'] as const;
const componentDesignSystemImports: Record<string, readonly string[]> = {
  'src/lib/components/PasskeySettings.svelte': ['Button', 'Field', 'Input', 'Label', 'Surface'],
  'src/lib/components/ProviderButton.svelte': ['Button'],
  'src/lib/components/PasswordField.svelte': [
    'ErrorText',
    'Field',
    'HelpText',
    'IconButton',
    'Input',
    'Label'
  ],
  'src/lib/components/LoginIdField.svelte': ['ErrorText', 'Field', 'HelpText', 'Input', 'Label'],
  'src/lib/components/PasswordSignupFields.svelte': ['Checkbox', 'Stack'],
  'src/lib/components/AuthShell.svelte': ['Button', 'Divider', 'Inline', 'Link', 'Stack', 'Surface'],
  'src/lib/components/ProductLinkApproval.svelte': ['Button', 'Inline', 'Stack', 'Surface']
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
  'examples/clean-consumer/AuthUiCleanConsumer.svelte',
  '.github/workflows/ci.yml',
  'vite.config.ts',
  'vite.server.config.ts',
  'scripts/check-ssr-package-surface.ts',
  'src/lib/auth-contract.ts',
  'src/lib/auth-handoff.ts',
  'src/lib/i18n.ts',
  'src/lib/index.ts',
  'src/lib/passkey.ts',
  'src/lib/product-link.ts',
  'src/lib/password-signup.ts',
  'src/styles/index.css'
] as const;

const [
  packageSource,
  changelog,
  readme,
  runbook,
  service,
  ciWorkflow,
  bunLockSource,
  installedDesignSystemSource
] = await Promise.all([
  readFile(join(root, 'package.json'), 'utf8'),
  readFile(join(root, 'CHANGELOG.md'), 'utf8'),
  readFile(join(root, 'README.md'), 'utf8'),
  readFile(join(root, 'RUNBOOK.md'), 'utf8'),
  readFile(join(root, 'service.yaml'), 'utf8'),
  readFile(join(root, '.github', 'workflows', 'ci.yml'), 'utf8'),
  readFile(join(root, 'bun.lock'), 'utf8'),
  readFile(join(root, 'node_modules', 'zdp-design-system', 'package.json'), 'utf8')
]);
const packageJson = JSON.parse(packageSource) as PackageJson;
const installedDesignSystem = JSON.parse(installedDesignSystemSource) as PackageJson;
const sourceFiles = await readSourceFiles(join(root, 'src', 'lib'));
const exampleFiles = await Promise.all(
  exampleComponentPaths.map(async (relativePath) => ({
    relativePath,
    source: await readFile(join(root, relativePath), 'utf8')
  }))
);

checkRequiredFiles();
checkPackageJson(packageJson, changelog, bunLockSource, installedDesignSystem);
checkLocaleContract(readme);
checkLocalizedAuthMessages();
checkMessageCatalog();
checkServiceBoundary(service);
checkCiWorkflow(ciWorkflow);
checkRunbook(runbook);
await checkPublicEntry();
checkBuildBoundary();
checkSourceBoundary(sourceFiles);
checkCleanConsumerExamples(exampleFiles);
await checkSvelteCompilation();
await checkDistBundleExternalization();
await checkGeneratedLocaleEntries();

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

function checkBuildBoundary(): void {
  for (const [name, config, externalRoots] of [
    ['browser', browserBuildConfig, ['svelte', '@simplewebauthn/browser', 'zdp-design-system']],
    ['server', serverBuildConfig, ['svelte', '@simplewebauthn/browser']]
  ] as const) {
    const external = config.build?.rollupOptions?.external;
    if (typeof external !== 'function') {
      failures.push(`${name} build must expose a package externalization predicate.`);
      continue;
    }
    for (const packageRoot of externalRoots) {
      for (const id of [packageRoot, `${packageRoot}/internal/client`]) {
        if (external(id, undefined, false) !== true) {
          failures.push(`${name} build must externalize ${id}.`);
        }
      }
    }
    for (const id of ['./src/lib/index.ts', 'svelte-other', '@simplewebauthn/browser-other']) {
      if (external(id, undefined, false) === true) {
        failures.push(`${name} build must not externalize unrelated module ${id}.`);
      }
    }
    if (name === 'server' && external('zdp-design-system', undefined, false) === true) {
      failures.push('The server build must compile the design system for Node SSR.');
    }
  }
  if (serverBuildConfig.build?.ssr !== true
    || !Array.isArray(serverBuildConfig.ssr?.noExternal)
    || !serverBuildConfig.ssr.noExternal.includes('zdp-design-system')) {
    failures.push('The server build must enable SSR and compile the design system.');
  }
}

function checkPackageJson(
  packageJson: PackageJson,
  changelog: string,
  bunLockSource: string,
  installedDesignSystem: PackageJson
): void {
  if (!packageJson.version || !/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
    failures.push('package.json version must be an explicit semver value.');
  }

  if (packageJson.version && !changelog.includes(`## ${packageJson.version}`)) {
    failures.push(`CHANGELOG.md must include the current package version ${packageJson.version}.`);
  }

  const designSystemRange = packageJson.dependencies?.['zdp-design-system'];
  if (designSystemRange === undefined) {
    failures.push('zdp-auth-ui must consume the published zdp-design-system package.');
  } else {
    try {
      const lockEntry = readBunRegistryLockEntry(bunLockSource, 'zdp-design-system');
      assertVersionSatisfiesCaretRange(lockEntry.version, designSystemRange, 'zdp-design-system');

      if (installedDesignSystem.name !== 'zdp-design-system') {
        throw new Error('installed package name must be zdp-design-system.');
      }

      if (installedDesignSystem.version !== lockEntry.version) {
        throw new Error(
          `installed zdp-design-system@${installedDesignSystem.version ?? 'unknown'} must match bun.lock ${lockEntry.version}.`
        );
      }
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  if ((packageJson as { private?: boolean }).private !== false) {
    failures.push('package.json private must be false for public npm package consumption.');
  }

  if ((packageJson as { license?: string }).license !== 'MIT') {
    failures.push('package.json license must be MIT for public package consumption.');
  }

  for (const publicPackageFile of ['LICENSE', 'CONTRIBUTING.md', 'BOUNDARY.md', 'RUNBOOK.md', 'SECURITY.md', 'service.yaml']) {
    if (!packageJson.files?.includes(publicPackageFile)) {
      failures.push(`package.json files must include ${publicPackageFile} for public package consumption.`);
    }
  }

  if (!packageJson.dependencies?.['@simplewebauthn/browser']) {
    failures.push('zdp-auth-ui must declare @simplewebauthn/browser for passkey browser ceremony helpers.');
  }

  for (const forbiddenDependency of ['better-auth', 'drizzle-orm', '@libsql/client']) {
    if (packageJson.dependencies?.[forbiddenDependency] || packageJson.devDependencies?.[forbiddenDependency]) {
      failures.push(`Forbidden auth authority or datastore dependency present: ${forbiddenDependency}.`);
    }
  }

  if (packageJson.peerDependencies?.svelte !== '^5.56.0') {
    failures.push('Svelte must stay a ^5.56.0 peer dependency for Astro/SvelteKit/Tauri consumers.');
  }

  // CI runs these commands; their results and artifacts verify the pipeline.
  for (const name of ['check', 'build', 'test']) {
    if (!packageJson.scripts?.[name]?.trim()) {
      failures.push(`package.json must expose a ${name} command.`);
    }
  }

  checkPackageExports(packageJson);
}

function checkPackageExports(packageJson: PackageJson): void {
  const expectedExports = new Map<string, unknown>([
    [
      '.',
      {
        types: './dist/svelte/index.d.ts',
        svelte: './dist/svelte/index.js',
        browser: './dist/index.js',
        node: './dist/index.server.js',
        import: './dist/index.js',
        default: './dist/index.js'
      }
    ],
    ['./styles.css', './dist/styles.css'],
    [
      './i18n',
      {
        types: './dist/svelte/i18n.d.ts',
        import: './dist/i18n.js',
        default: './dist/i18n.js'
      }
    ],
    [
      './contract',
      {
        types: './dist/svelte/auth-contract.d.ts',
        import: './dist/contract.js',
        default: './dist/contract.js'
      }
    ]
  ]);

  expectedExports.set('./i18n/loader', {
    types: './dist/svelte/i18n/loader.d.ts',
    import: './dist/svelte/i18n/loader.js',
    default: './dist/svelte/i18n/loader.js'
  });
  expectedExports.set('./components', {
    types: './dist/svelte/components.d.ts',
    svelte: './dist/svelte/components.js',
    browser: './dist/components.js',
    node: './dist/components.server.js',
    import: './dist/components.js',
    default: './dist/components.js'
  });
  for (const locale of expectedLocales) {
    expectedExports.set(`./i18n/${locale}`, {
      types: `./dist/svelte/i18n/${locale}.d.ts`,
      import: `./dist/svelte/i18n/${locale}.js`,
      default: `./dist/svelte/i18n/${locale}.js`
    });
  }

  for (const [exportPath, expectedValue] of expectedExports) {
    const actualValue = packageJson.exports?.[exportPath];
    if (!actualValue) {
      failures.push(`package.json must export ${exportPath}.`);
      continue;
    }

    if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
      failures.push(`package.json export ${exportPath} must point at the generated dist package surface.`);
    }
  }

  if (!packageJson.files?.includes('dist/')) {
    failures.push('package.json files must include dist/ for public package consumption.');
  }

  if (packageJson.files?.includes('src/')) {
    failures.push('package.json files must not publish src/ because clean consumers must use the generated dist package surface.');
  }

  if (!packageJson.sideEffects?.includes('**/*.css')) {
    failures.push('package.json sideEffects must preserve the styles entry and consumer-generated component CSS.');
  }
}

function checkLocaleContract(readme: string): void {
  if (JSON.stringify(zdpAuthTargetLocales) !== JSON.stringify(expectedLocales)) {
    failures.push('Target locale metadata must preserve all 12 public locales.');
  }
  for (const locale of expectedLocales) {
    if (!Object.hasOwn(zdpAuthMessages, locale)) {
      failures.push(`Target locale ${locale} must have its own keyed message catalog.`);
    }
    if (!readme.includes(locale)) failures.push(`README.md is missing locale ${locale}.`);
  }
  for (const locale of expectedLocales) {
    if (getAuthMessages(locale) !== zdpAuthMessages[locale]) {
      failures.push(`Locale ${locale} must resolve its own catalog.`);
    }
  }
  for (const locale of ['unknown', '__proto__', 'constructor']) {
    if (getAuthMessages(locale) !== zdpAuthMessages.en) {
      failures.push(`Unsupported locale ${locale} must resolve English.`);
    }
  }
}

function checkLocalizedAuthMessages(): void {
  const expectedLoginTitles: Record<(typeof expectedLocales)[number], string> = {
    en: 'Sign in', zh: '登录', es: 'Iniciar sesión', fr: 'Se connecter', hi: 'साइन इन करें',
    ko: '로그인', ja: 'ログイン', vi: 'Đăng nhập', ru: 'Войти', id: 'Masuk', ms: 'Log masuk', th: 'เข้าสู่ระบบ'
  };
  const english = getAuthMessages('en');
  const englishProductLink = messageLeaves(english.productLink);
  for (const locale of expectedLocales) {
    const messages = getAuthMessages(locale);
    if (messages.title.login !== expectedLoginTitles[locale]) {
      failures.push(`Locale ${locale} must resolve its localized login catalog without English fallback.`);
    }
    if (!messages.fields.loginId || !messages.fields.password || !messages.actions.login) {
      failures.push(`Locale ${locale} must provide complete login field and action copy.`);
    }
    const productLink = messageLeaves(messages.productLink);
    if (JSON.stringify(Object.keys(productLink).sort()) !== JSON.stringify(Object.keys(englishProductLink).sort())) {
      failures.push(`Locale ${locale} must define every product-link message key.`);
    }
    for (const [key, value] of Object.entries(productLink)) {
      if (typeof value !== 'string' || !value.trim()) {
        failures.push(`Locale ${locale} has an empty product-link message: ${key}.`);
      } else if (locale !== 'en' && value === englishProductLink[key]) {
        failures.push(`Locale ${locale} must translate product-link message ${key} instead of using English.`);
      }
    }
    if (locale !== 'en' && messages.providers.passkey === english.providers.passkey) {
      failures.push(`Locale ${locale} must provide its localized passkey provider label.`);
    }
  }
}

function messageLeaves(catalog: object, prefix = ''): Record<string, unknown> {
  const leaves: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(catalog)) {
    const path = `${prefix}${key}`;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(leaves, messageLeaves(value, `${path}.`));
    } else {
      leaves[path] = value;
    }
  }
  return leaves;
}

function checkMessageCatalog(): void {
  const en = getAuthMessages('en');
  const ko = getAuthMessages('ko');
  for (const [actual, expected] of [
    [en.brand, '8ailors'], [ko.brand, '8ailors'],
    [ko.providers.groupLabel, '인증 수단 선택'], [en.providers.groupLabel, 'Choose sign-in method'],
    [ko.navigation.accountHelp, '계정 도움말'], [en.navigation.accountHelp, 'Account help'],
    [ko.summary.signup, '{brand} 계정을 생성합니다.'],
    [ko.availability.preparing, '계정 서비스는 아직 준비 중입니다.'],
    [en.availability.preparing, 'Account access is not available yet.']
  ]) {
    if (actual !== expected) failures.push(`Auth shell catalog must preserve copy: ${expected}.`);
  }
  for (const locale of zdpAuthTargetLocales) {
    const messages = getAuthMessages(locale);
    if (!messages.summary.login.includes('{brand}')) {
      failures.push(`Locale ${locale} login summary must include the {brand} placeholder.`);
    }
    for (const summary of Object.values(messages.summary)) {
      if (summary.includes(messages.brand)) {
        failures.push(`Locale ${locale} summary must use {brand} instead of a literal brand.`);
      }
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
    'permissions:\n  contents: read',
    'actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7',
    'persist-credentials: false',
    'Checkout auth UI',
    'projects/zdp-platforms/client-surfaces/zdp-auth-ui',
    'oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2',
    'bun install --frozen-lockfile',
    'bun run check',
    'bun run build'
  ]) {
    if (!ciWorkflow.includes(requiredText)) {
      failures.push(`.github/workflows/ci.yml must include auth UI CI contract: ${requiredText}.`);
    }
  }

  const actionReferences = [...ciWorkflow.matchAll(/^\s*(?:-\s+)?uses:\s+([^\s#]+)/gm)].map(
    (match) => match[1] ?? ''
  );
  if (
    actionReferences.length === 0 ||
    !actionReferences.every((reference) => /@[0-9a-f]{40}$/.test(reference))
  ) {
    failures.push('.github/workflows/ci.yml must pin every external Action to a full commit SHA.');
  }

  for (const forbiddenText of [
    'Checkout design system',
    '0disoft/zdp-design-system',
    'projects/zdp-platforms/client-surfaces/zdp-design-system',
    'ZDP_CI_READ_TOKEN'
  ]) {
    if (ciWorkflow.includes(forbiddenText)) {
      failures.push(`.github/workflows/ci.yml must not require sibling design-system checkout: ${forbiddenText}.`);
    }
  }
}

function checkRunbook(runbook: string): void {
  for (const requiredText of [
    'published `zdp-design-system` npm package',
    'zdp-design-system',
    'bun run check',
    'bun run build'
  ]) {
    if (!runbook.includes(requiredText)) {
      failures.push(`RUNBOOK.md must include auth UI CI operation text: ${requiredText}.`);
    }
  }
}

async function checkPublicEntry(): Promise<void> {
  const publicEntry = await import(pathToFileURL(join(root, 'dist', 'index.server.js')).href);
  for (const requiredExport of [
    'AuthShell',
    'LoginIdField',
    'PasswordField',
    'PasswordSignupFields',
    'ProductLinkApproval',
    'ProviderButton',
    'PasskeySettings',
    'zdpAuthTargetLocales',
    'zdpAuthActiveLocales',
    'zdpAuthPlannedLocales',
    'startPasskeyAuthentication',
    'startPasskeyRegistration',
    'cancelPasskeyCeremony',
    'detectPasskeySupport',
    'ZdpPasskeyCeremonyError',
    'buildZdpAuthHandoffUrl',
    'zdpAuthHandoffReturnPathRegistry',
    'validateProductLinkRequest',
    'zdpProductLinkStates',
    'createZdpPasswordSignupContract',
    'zdpPasswordSignupFieldNames',
    'zdpAuthAvailabilityStates'
  ]) {
    if (!Object.hasOwn(publicEntry, requiredExport) || publicEntry[requiredExport] === undefined) {
      failures.push(`Built package is missing public export ${requiredExport}.`);
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
    "method?: 'post';",
    "availability?: ZdpAuthAvailability;",
    "accountBrand?: string | null;",
    'normalizeAccountBrand(accountBrand)',
    '/[\\p{C}\\p{Zl}\\p{Zp}]/u',
    'method={formMethod}',
    'data-availability={availability}',
    'disabled={preparing}',
    'copy.availability.preparing',
    'aria-label={copy.providers.groupLabel}',
    'aria-label={copy.navigation.accountHelp}'
  ]) {
    if (!authShell.source.includes(requiredText)) {
      failures.push(`src/lib/components/AuthShell.svelte must keep auth boundary guard: ${requiredText}.`);
    }
  }

  if (authShell.source.includes("'get' | 'post'")) {
    failures.push("src/lib/components/AuthShell.svelte must not expose GET form submission.");
  }

  if (authShell.source.includes('novalidate')) {
    failures.push('src/lib/components/AuthShell.svelte must keep native constraint validation enabled for POST fallback forms.');
  }

  for (const requiredText of [
    "recoveryHref?: string | null;",
    "mode === 'login' && normalizedRecoveryHref && !preparing",
    '<Link href={normalizedRecoveryHref}>{copy.links.recovery}</Link>'
  ]) {
    if (!authShell.source.includes(requiredText)) {
      failures.push(`AuthShell recovery navigation must stay consumer-configured and login-only: ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "mode !== 'signup' || (preparing && !signupTermsInSlot)",
    'signupTermsInSlot = false,',
    'setContext<TermsLinkContext>',
    "import { termsLinkContextKey"
  ]) {
    if (!authShell.source.includes(requiredText)) {
      failures.push(`AuthShell must route signup terms links to PasswordSignupFields: ${requiredText}.`);
    }
  }

  // Consent placement, link updates, alignment and native validation are checked
  // against the rendered DOM by check-browser-accessibility.mjs.

  if (authShell.source.includes('href="?mode=recovery"')) {
    failures.push('AuthShell must not invent a recovery route when the consumer has not activated one.');
  }

  checkDesignSystemConsumption(sourceFiles);
  checkRawColorUsage(sourceFiles);
  for (const sourceFile of sourceFiles) {
    if (!sourceFile.relativePath.endsWith('.svelte')) continue;
    for (const violation of findStyleTokenViolations(sourceFile.source)) {
      failures.push(`${sourceFile.relativePath}:${violation.line} must use design-system spacing, size or typography tokens: ${violation.property}: ${violation.value}.`);
    }
  }
}

function checkCleanConsumerExamples(exampleFiles: readonly SourceFile[]): void {
  for (const exampleFile of exampleFiles) {
    for (const forbiddenText of forbiddenSourceBoundaryTexts) {
      if (exampleFile.source.includes(forbiddenText)) {
        failures.push(`${exampleFile.relativePath} must not own runtime auth storage or server calls: ${forbiddenText}.`);
      }
    }
  }

  const cleanConsumer = exampleFiles.find(
    (exampleFile) => exampleFile.relativePath === 'examples/clean-consumer/AuthUiCleanConsumer.svelte'
  );
  if (!cleanConsumer) {
    failures.push('examples/clean-consumer/AuthUiCleanConsumer.svelte must be included in clean consumer checks.');
    return;
  }

  for (const requiredText of [
    "from 'zdp-auth-ui'",
    'AuthShell',
    'PasswordSignupFields',
    'PasswordField',
    'ProductLinkApproval',
    'buildZdpAuthHandoffUrl',
    'getAuthMessages',
    'type ZdpAuthMode',
    'type ZdpAuthHandoffResult',
    'type ZdpAuthProvider',
    'type ZdpAuthSubmitDetail',
    'createZdpPasswordSignupContract',
    'type ZdpProductLinkRequest',
    'type ZdpProductLinkTrustPolicy',
    'onsubmit={handleSubmit}',
    'onmodechange=',
    'onproviderselect=',
    'termsHref="/terms"',
    'privacyHref="/privacy"',
    'accountBrand="ZDP"',
    'type ZdpAuthAvailability',
    'zdpAuthAvailabilityStates',
    'availability={availability}',
    'preparing',
    'helpText=',
    'errorText='
  ]) {
    if (!cleanConsumer.source.includes(requiredText)) {
      failures.push(`Clean consumer example is missing auth UI consumption contract: ${requiredText}.`);
    }
  }

  for (const forbiddenText of [
    'from \'./src',
    'from "../src',
    'from "../../src',
    'authorization',
    'refreshToken',
    'accessToken',
    'providerSecret',
    'passkeyChallenge'
  ]) {
    if (cleanConsumer.source.includes(forbiddenText)) {
      failures.push(`Clean consumer example must not deep import or store auth authority data: ${forbiddenText}.`);
    }
  }

  if (!/<PasswordField[\s\S]*?\brequired\b[\s\S]*?\/>/.test(cleanConsumer.source)) {
    failures.push('Clean consumer example must keep a required PasswordField as native validation evidence.');
  }
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
    for (const rawSpecifier of (match[1] ?? '').split(',')) {
      const specifier = rawSpecifier.trim();
      if (!specifier) {
        continue;
      }

      importNames.add((specifier.split(/\s+as\s+/)[0] ?? '').trim());
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
  for (const relativePath of [...componentPaths, ...exampleComponentPaths]) {
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

async function checkDistBundleExternalization(): Promise<void> {
  const distIndex = join(root, 'dist', 'index.js');
  if (!existsSync(distIndex)) {
    failures.push('dist/index.js must exist after build for bundle externalization checks.');
    return;
  }

  const bundle = await readFile(distIndex, 'utf8');
  if (!bundle.includes('from "svelte/internal/')) {
    failures.push(
      'dist/index.js must keep svelte internal imports external so consumers do not load a second Svelte runtime.'
    );
  }
  if (bundle.includes('StaleReactionError')) {
    failures.push('dist/index.js must not embed the Svelte internal client runtime.');
  }
}

async function checkGeneratedLocaleEntries(): Promise<void> {
  const distI18n = join(root, 'dist', 'svelte', 'i18n');

  for (const locale of expectedLocales) {
    const modulePath = join(distI18n, `${locale}.js`);
    const declarationPath = join(distI18n, `${locale}.d.ts`);
    if (!existsSync(modulePath) || !existsSync(declarationPath)) {
      failures.push(`Build must generate JavaScript and declaration entries for locale ${locale}.`);
      continue;
    }

    const localeModule = await import(pathToFileURL(modulePath).href) as {
      readonly locale?: unknown;
      readonly messages?: unknown;
      readonly default?: unknown;
    };
    const expectedMessages = getAuthMessages(locale);
    if (
      localeModule.locale !== locale
      || localeModule.default !== localeModule.messages
      || JSON.stringify(localeModule.messages) !== JSON.stringify(expectedMessages)
    ) {
      failures.push(`Generated locale entry ${locale} must preserve its literal locale and message SSOT.`);
    }

    // Declaration shapes and literal locales are verified by the TypeScript
    // consumer in tests/package-message-parity.ts, independent of formatting.
  }

  const loaderPath = join(distI18n, 'loader.js');
  const loaderDeclarationPath = join(distI18n, 'loader.d.ts');
  if (!existsSync(loaderPath) || !existsSync(loaderDeclarationPath)) {
    failures.push('Build must generate JavaScript and declaration entries for the locale loader.');
    return;
  }

  const loaderSource = await readFile(loaderPath, 'utf8');
  for (const forbiddenText of forbiddenSourceBoundaryTexts) {
    if (loaderSource.includes(forbiddenText)) {
      failures.push(`Generated locale loader must remain local and stateless: ${forbiddenText}.`);
    }
  }

  const loaderModule = await import(pathToFileURL(loaderPath).href) as {
    readonly loadAuthMessages?: (locale: string) => Promise<unknown>;
  };
  if (typeof loaderModule.loadAuthMessages !== 'function') {
    failures.push('Generated locale loader must export loadAuthMessages().');
    return;
  }

  for (const locale of expectedLocales) {
    const loaded = await loaderModule.loadAuthMessages(locale);
    if (JSON.stringify(loaded) !== JSON.stringify(getAuthMessages(locale))) {
      failures.push(`Locale loader must resolve the generated ${locale} catalog.`);
    }
  }

  const fallback = await loaderModule.loadAuthMessages('unsupported-locale');
  if (JSON.stringify(fallback) !== JSON.stringify(getAuthMessages('en'))) {
    failures.push('Locale loader must fall back to English for unsupported runtime values.');
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
