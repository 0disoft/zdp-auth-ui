import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const workflow = readFileSync(join(root, '.github', 'workflows', 'publish-npm.yml'), 'utf8');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  packageManager?: unknown;
  repository?: { url?: unknown };
  version?: unknown;
};
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
const serviceContract = readFileSync(join(root, 'service.yaml'), 'utf8');

assert.equal(typeof packageJson.version, 'string', 'package.json must declare a string version.');
assert.equal(packageJson.packageManager, 'bun@1.3.14');
assert.equal(packageJson.repository?.url, 'git+https://github.com/0disoft/zdp-auth-ui.git');
assert.match(workflow, /^name: Publish npm package$/m);
assert.match(workflow, /^\s+tags:$/m);
assert.ok(workflow.includes('- "v*"'));
assert.ok(workflow.includes('contents: write'));
assert.ok(workflow.includes('id-token: write'));
assert.ok(workflow.includes('group: npm-release-${{ github.repository }}-${{ github.ref }}'));
assert.ok(workflow.includes('cancel-in-progress: false'));
assert.ok(workflow.includes('timeout-minutes: 20'));
assert.ok(workflow.includes('uses: actions/checkout@v7'));
assert.ok(workflow.includes('fetch-depth: 0'));
assert.ok(workflow.includes('persist-credentials: false'));
assert.equal(
  workflow.match(/if: steps\.npm_state\.outputs\.already_published != 'true'/g)?.length,
  1
);
assert.ok(workflow.includes('name: Verify existing npm source anchor'));
assert.ok(workflow.includes("if: steps.npm_state.outputs.already_published == 'true'"));
assert.ok(workflow.includes('npm view "${package_name}@${package_version}" gitHead'));
assert.ok(workflow.includes('does not match release tag SHA ${GITHUB_SHA}'));
assert.ok(workflow.includes('name: Verify tagged commit is on main'));
assert.ok(workflow.includes('git merge-base --is-ancestor "$GITHUB_SHA" "origin/main"'));
assert.ok(workflow.includes('Release tag must point to a commit contained in origin/main.'));
assert.ok(workflow.includes('uses: actions/setup-node@v6'));
assert.ok(workflow.includes('registry-url: https://registry.npmjs.org'));
assert.ok(workflow.includes('uses: oven-sh/setup-bun@v2'));
assert.ok(workflow.includes('bun-version: 1.3.14'));
assert.ok(workflow.includes('name: Verify npm trusted publishing support'));
assert.ok(workflow.includes('npm 11.5.1 or later is required'));
assert.ok(workflow.includes('bun install --frozen-lockfile'));
assert.ok(workflow.includes('Release tag ${GITHUB_REF_NAME} does not match'));
assert.ok(workflow.includes('run: bun run build'));
assert.ok(workflow.includes('run: bun run check'));
assert.ok(workflow.includes('run: bun run browser:check'));
assert.ok(workflow.includes('id: package_artifact'));
assert.ok(workflow.includes('bun scripts/build-release-artifact.ts --git-head "$GITHUB_SHA" --github-output "$GITHUB_OUTPUT"'));
assert.ok(workflow.includes('steps.package_artifact.outputs.tarball'));
assert.ok(workflow.includes('steps.package_artifact.outputs.integrity'));
assert.ok(workflow.includes('already_published=true'));
assert.ok(workflow.includes('npm publish "${{ steps.package_artifact.outputs.tarball }}" --access public'));
assert.ok(!workflow.includes('npm publish --access public --provenance'));
assert.ok(!workflow.includes('NPM_TOKEN'));
assert.ok(!workflow.includes('NODE_AUTH_TOKEN'));
assert.ok(workflow.includes('dist.integrity'));
assert.ok(workflow.includes('does not match packed artifact integrity'));
assert.ok(workflow.includes('npm view "${package_name}@${package_version}" dist.tarball'));
assert.ok(workflow.includes('CHANGELOG.md does not contain'));
assert.ok(workflow.includes('gh release create "$GITHUB_REF_NAME"'));
assert.ok(!workflow.includes('release:\n'));
assert.ok(serviceContract.includes('required_secrets: []'));
assert.ok(
  changelog.includes(`## ${packageJson.version}`),
  `CHANGELOG.md must contain a ${packageJson.version} release section.`
);

console.log('Release workflow check passed.');
