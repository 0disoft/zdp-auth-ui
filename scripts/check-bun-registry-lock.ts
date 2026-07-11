import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import {
  assertVersionSatisfiesCaretRange,
  readBunRegistryLockEntry
} from './bun-registry-lock';

const integrity = `sha512-${Buffer.alloc(64, 13).toString('base64')}`;
const validEntry = `    "zdp-design-system": ["zdp-design-system@0.46.4", "", { "peerDependencies": { "svelte": "^5.56.0" } }, "${integrity}"],`;
const validLock = `{
  "lockfileVersion": 1,
  "packages": {
${validEntry}
  }
}`;

assert.deepEqual(readBunRegistryLockEntry(validLock, 'zdp-design-system'), {
  packageName: 'zdp-design-system',
  version: '0.46.4',
  integrity
});
assert.doesNotThrow(() =>
  assertVersionSatisfiesCaretRange('0.46.8', '^0.46.4', 'zdp-design-system')
);
assert.throws(
  () => assertVersionSatisfiesCaretRange('0.47.0', '^0.46.4', 'zdp-design-system'),
  /does not satisfy declared range/
);
assert.throws(
  () => readBunRegistryLockEntry(`${validLock}\n${validEntry}`, 'zdp-design-system'),
  /exactly one registry entry/
);
assert.throws(
  () => readBunRegistryLockEntry(validLock.replace(integrity, 'sha512-YQ=='), 'zdp-design-system'),
  /64-byte sha512 digest/
);

console.log('Bun registry lock contract check passed.');
