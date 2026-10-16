import assert from 'node:assert/strict';
import { build } from 'vite';
import { getAuthMessages, zdpAuthTargetLocales } from '../src/lib/i18n';
import { getPasskeySettingsMessages } from '../src/lib/passkey-settings-messages';

// Bundle the published JS surface, externalizing host runtimes so the byte
// comparison measures this package rather than a consumer's framework version.
async function consumerBundle(componentEntry: string, lazy: boolean) {
  const entry = '\0auth-locale-consumer';
  const result = await build({
    configFile: false,
    logLevel: 'error',
    plugins: [{
      name: 'auth-locale-consumer',
      resolveId(id) { return id === entry ? entry : null; },
      load(id) {
        if (id !== entry) return null;
        return `export { AuthShell, LoginIdField, PasswordField, PasswordSignupFields,
          ProductLinkApproval, ProviderButton, PasskeySettings } from '${componentEntry}';
          ${lazy
            ? "export { loadAuthLocale } from 'zdp-auth-ui/i18n/loader';"
            : "export { messages, passkeySettingsMessages } from 'zdp-auth-ui/i18n/ko';"}`;
      }
    }],
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: entry,
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
const fixedCode = fixed.initial.map(chunk => chunk.code).join('\n');
const lazyCode = lazy.initial.map(chunk => chunk.code).join('\n');
assertCatalogsAbsent(fixedCode, zdpAuthTargetLocales.filter(locale => locale !== 'ko'));
assertCatalogsAbsent(lazyCode, zdpAuthTargetLocales);
assert.ok(fixedCode.includes(getAuthMessages('ko').title.login));
assert.ok(fixedCode.includes(getPasskeySettingsMessages('ko').title));

for (const bundle of [fixed, lazy]) {
  const modules = bundle.initial.flatMap(chunk => Object.keys(chunk.modules))
    .map(id => id.replaceAll('\\', '/'));
  assert.ok(!modules.some(id => /\/dist\/(?:i18n|index)\.js$/.test(id)),
    'Lean component imports must not pull in either synchronous compatibility entry.');
}
for (const locale of zdpAuthTargetLocales) {
  assert.ok(lazy.chunks.some(chunk => !lazy.initial.includes(chunk)
    && Object.keys(chunk.modules).some(id => id.replaceAll('\\', '/').endsWith(`/dist/i18n/${locale}.js`))),
  `Runtime consumer must retain a separate lazy ${locale} catalog.`);
}
assert.ok(fixed.initialBytes < legacy.initialBytes);
assert.ok(lazy.initialBytes < fixed.initialBytes);
console.log(JSON.stringify({
  packageJavaScriptBytes: {
    compatibilityWithKorean: legacy.initialBytes,
    componentsWithKorean: fixed.initialBytes,
    componentsWithLoaderInitial: lazy.initialBytes
  },
  lazyLocaleChunks: zdpAuthTargetLocales.length
}, null, 2));
