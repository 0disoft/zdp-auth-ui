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

const validRequest: ZdpAuthHandoffRequest = {
  mode: 'login',
  productId: 'melamed',
  trustedAuthOrigin: 'https://accounts.zdp.example',
  returnPath: '/apply'
};

const typecheckProgram = ts.createProgram({
  rootNames: [resolve('src/lib/auth-handoff.ts')],
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
assert.deepEqual(zdpAuthHandoffProductIds, ['melamed']);
assert.deepEqual(zdpAuthHandoffReturnPathRegistry, { melamed: ['/apply'] });
assert.equal(Object.isFrozen(zdpAuthHandoffModes), true);
assert.equal(Object.isFrozen(zdpAuthHandoffProductIds), true);
assert.equal(Object.isFrozen(zdpAuthHandoffReturnPathRegistry), true);
assert.equal(Object.isFrozen(zdpAuthHandoffReturnPathRegistry.melamed), true);

assert.deepEqual(
  buildZdpAuthHandoffUrl(validRequest),
  {
    outcome: 'created',
    url: 'https://accounts.zdp.example/login?product_id=melamed&return_path=%2Fapply'
  },
  'Login handoff URLs must use the fixed route and canonical query order.'
);

assert.deepEqual(
  buildZdpAuthHandoffUrl({ ...validRequest, mode: 'signup' }),
  {
    outcome: 'created',
    url: 'https://accounts.zdp.example/signup?product_id=melamed&return_path=%2Fapply'
  },
  'Signup handoff URLs must use the fixed route and canonical query order.'
);

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
    { ...validRequest, productId: 'melamed&return_path=/other' }
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
