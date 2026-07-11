import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const workflow = readFileSync(join(root, '.github', 'workflows', 'publish-npm.yml'), 'utf8');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  version?: unknown;
};
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');

assert.equal(typeof packageJson.version, 'string', 'package.json must declare a string version.');
assert.match(workflow, /^name: Publish npm package$/m);
assert.match(workflow, /^\s+tags:$/m);
assert.ok(workflow.includes('- "v*"'));
assert.ok(workflow.includes('contents: write'));
assert.ok(workflow.includes('id-token: write'));
assert.ok(workflow.includes('uses: actions/checkout@v7'));
assert.ok(workflow.includes('uses: actions/setup-node@v6'));
assert.ok(workflow.includes('registry-url: https://registry.npmjs.org'));
assert.ok(workflow.includes('uses: oven-sh/setup-bun@v2'));
assert.ok(workflow.includes('bun install --frozen-lockfile'));
assert.ok(workflow.includes('Release tag ${GITHUB_REF_NAME} does not match'));
assert.ok(workflow.includes('run: bun run build'));
assert.ok(workflow.includes('run: bun run check'));
assert.ok(workflow.includes('run: bun run browser:check'));
assert.ok(workflow.includes('npm pack --dry-run --json'));
assert.ok(workflow.includes('already_published=true'));
assert.ok(workflow.includes('npm publish --access public --provenance'));
assert.ok(workflow.includes('NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}'));
assert.ok(workflow.includes('npm view "${package_name}@${package_version}" dist.tarball'));
assert.ok(workflow.includes('CHANGELOG.md does not contain'));
assert.ok(workflow.includes('gh release create "$GITHUB_REF_NAME"'));
assert.ok(!workflow.includes('release:\n'));
assert.ok(
  changelog.includes(`## ${packageJson.version}`),
  `CHANGELOG.md must contain a ${packageJson.version} release section.`
);

console.log('Release workflow check passed.');
