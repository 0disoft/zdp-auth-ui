import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const workflow = readFileSync(join(root, '.github', 'workflows', 'publish-npm.yml'), 'utf8');
const ciWorkflow = readFileSync(join(root, '.github', 'workflows', 'ci.yml'), 'utf8');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  packageManager?: unknown;
  repository?: { url?: unknown };
  version?: unknown;
};
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
const serviceContract = readFileSync(join(root, 'service.yaml'), 'utf8');
const actionReferences = [...workflow.matchAll(/^\s*- uses:\s+([^\s#]+)/gm)].map((match) => match[1]);
const ciActionReferences = [...ciWorkflow.matchAll(/^\s*(?:-\s+)?uses:\s+([^\s#]+)/gm)].map((match) => match[1]);

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
assert.ok(workflow.includes('uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7'));
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
assert.ok(workflow.includes('uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6'));
assert.ok(workflow.includes('registry-url: https://registry.npmjs.org'));
assert.ok(workflow.includes('uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2'));
assert.ok(actionReferences.length > 0, 'Release workflow must use at least one external action.');
assert.ok(
  actionReferences.every((reference) => /@[0-9a-f]{40}$/.test(reference)),
  'Every release workflow action must be pinned to a full commit SHA.'
);
assert.ok(ciWorkflow.includes('permissions:\n  contents: read'));
assert.ok(ciWorkflow.includes('uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7'));
assert.ok(ciWorkflow.includes('persist-credentials: false'));
assert.ok(ciWorkflow.includes('uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2'));
assert.ok(ciActionReferences.length > 0, 'Main CI must use at least one external action.');
assert.ok(
  ciActionReferences.every((reference) => /@[0-9a-f]{40}$/.test(reference)),
  'Every main CI action must be pinned to a full commit SHA.'
);
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
assert.ok(workflow.includes('steps.package_artifact.outputs.manifest'));
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
assert.ok(workflow.includes('gh release download "$GITHUB_REF_NAME"'));
assert.ok(workflow.includes('cmp "$RELEASE_TARBALL" "$release_assets/$RELEASE_TARBALL"'));
assert.ok(workflow.includes('cmp "$RELEASE_MANIFEST" "$release_assets/$RELEASE_MANIFEST"'));
assert.ok(workflow.includes('"$RELEASE_TARBALL#npm package tarball"'));
assert.ok(workflow.includes('"$RELEASE_MANIFEST#npm release artifact manifest"'));
assert.ok(!workflow.includes('gh release upload'));
assert.ok(!workflow.includes('--clobber'));
assert.ok(!workflow.includes('release:\n'));
assert.ok(serviceContract.includes('required_secrets: []'));
assert.ok(
  changelog.includes(`## ${packageJson.version}`),
  `CHANGELOG.md must contain a ${packageJson.version} release section.`
);

console.log('Release workflow check passed.');
