import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { getAuthMessages, zdpAuthTargetLocales } from '../src/lib/i18n';
import { getPasskeySettingsMessages } from '../src/lib/passkey-settings-messages';

// Bundle the published Svelte surface, externalizing host runtimes so the byte
// comparison measures this package rather than a consumer's framework version.
async function consumerBundle(componentEntry: string, lazy: boolean, compileSvelte = true, fixture?: string) {
  const entry = '\0auth-locale-consumer';
  const result = await build({
    configFile: false,
    logLevel: 'error',
    plugins: [...(compileSvelte ? [svelte()] : []), {
      name: 'auth-locale-consumer',
      resolveId(id) { return id === entry ? entry : null; },
      load(id) {
        if (id !== entry) return null;
        return `export { AuthShell, LoginIdField, PasswordField, PasswordSignupFields,
          ProductLinkApproval, ProviderButton, PasskeySettings } from '${componentEntry}';
          import { createZdpAuthSurfaceModel } from '${componentEntry}';
          ${lazy
            ? `import { loadAuthLocale } from 'zdp-auth-ui/i18n/loader';
               export { loadAuthLocale };
               export async function loadSurface(locale) {
                 const { messages } = await loadAuthLocale(locale);
                 return createZdpAuthSurfaceModel({ locale, messages, mode: 'login', availability: 'available',
                   providerFlags: { passkey: true } });
               }`
            : `import { messages, passkeySettingsMessages } from 'zdp-auth-ui/i18n/ko';
               export { messages, passkeySettingsMessages };
               export const surface = createZdpAuthSurfaceModel({ locale: 'ko', messages, mode: 'login',
                 availability: 'available', providerFlags: { passkey: true } });`}`;
      }
    }],
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: fixture ?? entry,
        preserveEntrySignatures: 'strict',
        external: /^(?:svelte(?:\/|$)|zdp-design-system(?:\/|$)|@simplewebauthn\/browser(?:\/|$))/,
        output: { format: 'es' }
      }
    }
  });
  assert.ok(!Array.isArray(result) && 'output' in result);
  const chunks = result.output.filter(item => item.type === 'chunk');
  const initial = new Set<string>();
  const visit = (fileName: string) => {
    if (initial.has(fileName)) return;
    const chunk = chunks.find(item => item.fileName === fileName);
    if (!chunk) return; // external host runtime
    initial.add(fileName);
    chunk.imports.forEach(visit);
  };
  chunks.filter(chunk => chunk.isEntry).forEach(chunk => visit(chunk.fileName));
  return {
    chunks,
    initial: chunks.filter(chunk => initial.has(chunk.fileName)),
    initialBytes: chunks.filter(chunk => initial.has(chunk.fileName))
      .reduce((bytes, chunk) => bytes + Buffer.byteLength(chunk.code), 0)
  };
}

function assertCatalogsAbsent(code: string, locales: readonly string[]) {
  for (const locale of locales) {
    assert.ok(!code.includes(getAuthMessages(locale).title.login),
      `Initial bundle unexpectedly contains ${locale} auth copy.`);
    assert.ok(!code.includes(getPasskeySettingsMessages(locale).title),
      `Initial bundle unexpectedly contains ${locale} passkey settings copy.`);
  }
}

const fixed = await consumerBundle('zdp-auth-ui/components', false);
const lazy = await consumerBundle('zdp-auth-ui/components', true);
const legacy = await consumerBundle('zdp-auth-ui', false);
const compiledFixed = await consumerBundle('zdp-auth-ui/components', false, false);
const compiledLazy = await consumerBundle('zdp-auth-ui/components', true, false);
const signup = await consumerBundle('zdp-auth-ui/components', false, true,
  resolve('tests/bundles/KoreanPasswordSignup.svelte'));
const management = await consumerBundle('zdp-auth-ui/components', false, true,
  resolve('tests/bundles/LeanManagement.ts'));
assertCatalogsAbsent(management.initial.map(chunk => chunk.code).join('\n'), zdpAuthTargetLocales);
const managementExports = management.initial.flatMap(chunk => chunk.exports);
for (const name of ['AuthShell', 'PasskeySettings', 'ProductLinkApproval', 'validPasskeyLabel',
  'validateProductLinkRequest', 'isZdpPasskeyAuthenticatorProvider', 'isZdpPasskeyAuthenticatorStorage',
  'isZdpPasskeyRegistrationPreference', 'zdpPasskeyAuthenticatorProviders', 'zdpPasskeyAuthenticatorStorages',
  'zdpPasskeyRegistrationPreferenceDefault', 'zdpPasskeyRegistrationPreferences', 'startPasskeyAuthentication',
  'startPasskeyRegistration', 'detectPasskeySupport', 'cancelPasskeyCeremony', 'ZdpPasskeyCeremonyError',
  'zdpPasskeyCeremonyKinds', 'zdpPasskeyAuthenticationMediationModes', 'zdpPasskeyErrorReasons']) {
  assert.ok(managementExports.includes(name), `Catalog-free management bundle must retain ${name}.`);
}
const managementModules = management.initial.flatMap(chunk => Object.keys(chunk.modules))
  .map(id => id.replaceAll('\\', '/'));
assert.ok(!managementModules.some(id => /\/dist\/(?:svelte\/)?(?:i18n|index)\.js$/.test(id)),
  'Management utilities and components must not import a synchronous compatibility entry.');
const fixedCode = fixed.initial.map(chunk => chunk.code).join('\n');
const lazyCode = lazy.initial.map(chunk => chunk.code).join('\n');
const signupCode = signup.initial.map(chunk => chunk.code).join('\n');
assertCatalogsAbsent(signupCode, zdpAuthTargetLocales.filter(locale => locale !== 'ko'));
assert.ok(signupCode.includes(getAuthMessages('ko').title.signup));
const signupModules = signup.initial.flatMap(chunk => Object.keys(chunk.modules))
  .map(id => id.replaceAll('\\', '/'));
for (const module of ['components/AuthShell.svelte', 'components/PasswordSignupFields.svelte']) {
  assert.ok(signupModules.some(id => id.endsWith(`/dist/svelte/${module}`)),
    `Signup bundle must retain the actual component and contract composition: ${module}.`);
}
assert.ok(signupCode.includes('signup-bundle-terms-v1') && signupCode.includes('signup-bundle-age-v1'),
  'Signup must retain the contract values passed to PasswordSignupFields.');
for (const locale of zdpAuthTargetLocales.filter(locale => locale !== 'ko')) {
  assert.ok(!signupModules.some(id => new RegExp(`/i18n/(?:auth/|passkey-settings/)?${locale}\\.js$`).test(id)),
    `Korean signup must not retain the ${locale} catalog module.`);
}
assert.ok(!signupModules.some(id => /\/dist\/(?:svelte\/)?(?:i18n|index)\.js$/.test(id)),
  'Signup contract must not pull in a synchronous compatibility entry.');
assertCatalogsAbsent(fixedCode, zdpAuthTargetLocales.filter(locale => locale !== 'ko'));
assertCatalogsAbsent(lazyCode, zdpAuthTargetLocales);
assertCatalogsAbsent(compiledFixed.initial.map(chunk => chunk.code).join('\n'),
  zdpAuthTargetLocales.filter(locale => locale !== 'ko'));
assertCatalogsAbsent(compiledLazy.initial.map(chunk => chunk.code).join('\n'), zdpAuthTargetLocales);
assert.ok(fixedCode.includes(getAuthMessages('ko').title.login));
assert.ok(fixedCode.includes(getPasskeySettingsMessages('ko').title));

for (const bundle of [fixed, lazy]) {
  const modules = bundle.initial.flatMap(chunk => Object.keys(chunk.modules))
    .map(id => id.replaceAll('\\', '/'));
  assert.ok(modules.some(id => id.includes('/dist/svelte/components/AuthShell.svelte')),
    'Svelte consumers must compile the packaged components instead of the precompiled fallback.');
  assert.ok(modules.some(id => id.endsWith('/dist/svelte/auth-surface-model-core.js')),
    'Bundle coverage must include the injected model builder alongside the components.');
  assert.ok(!modules.some(id => /\/dist\/(?:svelte\/)?(?:i18n|index)\.js$/.test(id)),
    'Lean component imports must not pull in either synchronous compatibility entry.');
}
for (const locale of zdpAuthTargetLocales) {
  assert.ok(lazy.chunks.some(chunk => !lazy.initial.includes(chunk)
    && Object.keys(chunk.modules).some(id => id.replaceAll('\\', '/').endsWith(`/dist/svelte/i18n/${locale}.js`))),
  `Runtime consumer must retain a separate lazy ${locale} catalog.`);
}
assert.ok(fixed.initialBytes < legacy.initialBytes);
assert.ok(lazy.initialBytes < fixed.initialBytes);
console.log(JSON.stringify({
  packageJavaScriptBytes: {
    compatibilityWithKorean: legacy.initialBytes,
    componentsWithKorean: fixed.initialBytes,
    signupWithKoreanAndContract: signup.initialBytes,
    managementWithoutCatalogs: management.initialBytes,
    componentsWithLoaderInitial: lazy.initialBytes
  },
  precompiledJavaScriptBytes: {
    componentsWithKorean: compiledFixed.initialBytes,
    componentsWithLoaderInitial: compiledLazy.initialBytes
  },
  lazyLocaleChunks: zdpAuthTargetLocales.length
}, null, 2));
