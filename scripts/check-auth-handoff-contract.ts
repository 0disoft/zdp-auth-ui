import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import ts from 'typescript';
import {
  buildZdpAuthHandoffUrl,
  zdpAuthHandoffModes,
  zdpAuthHandoffProductIds,
  zdpAuthHandoffReturnPathRegistry,
  type ZdpAuthHandoffRequest,
  type ZdpAuthHandoffResult
} from '../src/lib/auth-handoff';
import { checkAuthHandoffRegistryGeneratedFiles } from './auth-handoff-registry-generation';

await checkAuthHandoffRegistryGeneratedFiles();

const primaryProductId = zdpAuthHandoffProductIds[0];
assert.ok(primaryProductId, 'The generated handoff registry must contain at least one product.');
const primaryReturnPath = zdpAuthHandoffReturnPathRegistry[primaryProductId][0];
assert.ok(primaryReturnPath, `Product ${primaryProductId} must contain at least one return path.`);

const validRequest: ZdpAuthHandoffRequest = {
  mode: 'login',
  productId: primaryProductId,
  trustedAuthOrigin: 'https://accounts.zdp.example',
  returnPath: primaryReturnPath
};

const typecheckProgram = ts.createProgram({
  rootNames: [
    resolve('src/lib/auth-handoff.ts'),
    resolve('src/lib/auth-handoff-registry.generated.ts'),
    resolve('scripts/auth-handoff-registry-generation.ts'),
    resolve('scripts/generate-auth-handoff-registry.ts')
  ],
  options: {
    forceConsistentCasingInFileNames: true,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    noFallthroughCasesInSwitch: true,
    noImplicitReturns: true,
    noUncheckedIndexedAccess: true,
    skipLibCheck: false,
    strict: true,
    target: ts.ScriptTarget.ES2022
  }
});
const typecheckDiagnostics = ts.getPreEmitDiagnostics(typecheckProgram);
assert.equal(
  typecheckDiagnostics.length,
  0,
  typecheckDiagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')).join('\n')
);

assert.deepEqual(zdpAuthHandoffModes, ['login', 'signup']);
assert.equal(zdpAuthHandoffProductIds.length > 0, true);
assert.equal(Object.isFrozen(zdpAuthHandoffModes), true);
assert.equal(Object.isFrozen(zdpAuthHandoffProductIds), true);
assert.equal(Object.isFrozen(zdpAuthHandoffReturnPathRegistry), true);

for (const productId of zdpAuthHandoffProductIds) {
  const registeredReturnPaths = zdpAuthHandoffReturnPathRegistry[productId];
  assert.equal(registeredReturnPaths.length > 0, true, `Product ${productId} must register a return path.`);
  assert.equal(Object.isFrozen(registeredReturnPaths), true);

  for (const returnPath of registeredReturnPaths) {
    const query = new URLSearchParams([
      ['product_id', productId],
      ['return_path', returnPath]
    ]).toString();

    assert.deepEqual(
      buildZdpAuthHandoffUrl({ ...validRequest, productId, returnPath }),
      {
        outcome: 'created',
        url: `https://accounts.zdp.example/login?${query}`
      },
      `Login handoff URL must be generated for ${productId}${returnPath}.`
    );

    assert.deepEqual(
      buildZdpAuthHandoffUrl({ ...validRequest, mode: 'signup', productId, returnPath }),
      {
        outcome: 'created',
        url: `https://accounts.zdp.example/signup?${query}`
      },
      `Signup handoff URL must be generated for ${productId}${returnPath}.`
    );
  }
}

for (const trustedAuthOrigin of [
  'http://accounts.zdp.example',
  'https://accounts.zdp.example/',
  'https://accounts.zdp.example/auth',
  'https://accounts.zdp.example?next=value',
  'https://accounts.zdp.example#section',
  'https://name:value@accounts.zdp.example',
  'https://accounts.zdp.example\n',
  'not an origin'
]) {
  assertRejected(
    buildZdpAuthHandoffUrl({ ...validRequest, trustedAuthOrigin }),
    'invalid-auth-origin',
    `Unsafe auth origin must fail closed: ${JSON.stringify(trustedAuthOrigin)}`
  );
}

for (const returnPath of [
  'https://evil.example/apply',
  '//evil.example/apply',
  '\\\\evil.example\\apply',
  '/apply\\next',
  '/apply#section',
  '/apply?next=/other',
  '/apply&next=/other',
  '/apply=other',
  '/apply\u0000next',
  '/../apply',
  '/safe/../apply',
  '/safe/./apply'
]) {
  assertRejected(
    buildZdpAuthHandoffUrl({ ...validRequest, returnPath }),
    'unsafe-return-path',
    `Unsafe return path must fail closed: ${JSON.stringify(returnPath)}`
  );
}

for (const returnPath of ['/apply%', '/apply%2', '/apply%GG']) {
  assertRejected(
    buildZdpAuthHandoffUrl({ ...validRequest, returnPath }),
    'malformed-return-path-encoding',
    `Malformed return-path encoding must fail closed: ${JSON.stringify(returnPath)}`
  );
}

for (const returnPath of [
  '/%2e%2e/apply',
  '/%2E%2E/apply',
  '/%252e%252e/apply',
  '%2F%2Fevil.example%2Fapply',
  '/apply%3Fnext%3D%2Fother'
]) {
  assertRejected(
    buildZdpAuthHandoffUrl({ ...validRequest, returnPath }),
    'noncanonical-return-path',
    `Encoded return paths must fail closed before registry lookup: ${JSON.stringify(returnPath)}`
  );
}

assertRejected(
  buildZdpAuthHandoffUrl({ ...validRequest, returnPath: '/unregistered' }),
  'unregistered-return-path',
  'A safe-looking path outside the closed product registry must fail closed.'
);
assertRejected(
  buildZdpAuthHandoffUrl({ ...validRequest, returnPath: `/${'a'.repeat(161)}` }),
  'invalid-return-path',
  'Return paths beyond the fixed bound must fail closed.'
);

assert.deepEqual(
  Reflect.apply(buildZdpAuthHandoffUrl, undefined, [
    { ...validRequest, mode: 'recovery' }
  ]),
  { outcome: 'rejected', reason: 'unsupported-mode' },
  'Runtime callers cannot add an unregistered auth mode.'
);
assert.deepEqual(
  Reflect.apply(buildZdpAuthHandoffUrl, undefined, [
    { ...validRequest, productId: `${primaryProductId}&return_path=/other` }
  ]),
  { outcome: 'rejected', reason: 'untrusted-product' },
  'Product identifiers cannot inject query delimiters or bypass the closed registry.'
);
assert.deepEqual(
  Reflect.apply(buildZdpAuthHandoffUrl, undefined, [null]),
  { outcome: 'rejected', reason: 'invalid-request' },
  'Malformed runtime calls must return a typed rejection instead of throwing.'
);

console.log('Auth handoff contract check passed.');

function assertRejected(
  result: ZdpAuthHandoffResult,
  reason: Extract<ZdpAuthHandoffResult, { outcome: 'rejected' }>['reason'],
  message: string
): void {
  assert.deepEqual(result, { outcome: 'rejected', reason }, message);
}
