import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { appendFile, cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

interface PackageManifest {
  readonly name?: unknown;
  readonly version?: unknown;
  readonly files?: unknown;
  readonly [key: string]: unknown;
}

interface PackResult {
  readonly filename?: unknown;
  readonly integrity?: unknown;
}

const root = fileURLToPath(new URL('..', import.meta.url));
const checkGitHead = '0123456789abcdef0123456789abcdef01234567';

function readTarEntry(archive: Buffer, expectedName: string): Buffer {
  const tar = gunzipSync(archive);

  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;

    const readString = (start: number, end: number) => {
      const value = header.subarray(start, end).toString('utf8');
      const terminator = value.indexOf('\0');
      return terminator >= 0 ? value.slice(0, terminator) : value;
    };
    const name = readString(0, 100);
    const prefix = readString(345, 500);
    const path = prefix ? `${prefix}/${name}` : name;
    const sizeText = readString(124, 136).trim();
    const size = sizeText ? Number.parseInt(sizeText, 8) : 0;
    assert.ok(Number.isSafeInteger(size) && size >= 0, `Invalid tar entry size for ${path}.`);

    const contentStart = offset + 512;
    const contentEnd = contentStart + size;
    assert.ok(contentEnd <= tar.length, `Truncated tar entry ${path}.`);
    if (path === expectedName) return tar.subarray(contentStart, contentEnd);

    offset = contentStart + Math.ceil(size / 512) * 512;
  }

  throw new Error(`Tar entry ${expectedName} was not found.`);
}

function assertRelativePackagePath(path: string): void {
  const segments = path.replaceAll('\\', '/').split('/');
  assert.ok(path.length > 0, 'Package file entries must not be empty.');
  assert.ok(!isAbsolute(path), `Package file entry must be relative: ${path}`);
  assert.ok(!segments.includes('..'), `Package file entry must not escape the repository: ${path}`);
}

async function buildArtifact(gitHead: string, artifactDirectory: string): Promise<{
  readonly tarball: string;
  readonly integrity: string;
  readonly manifest: string;
}> {
  assert.match(gitHead, /^[0-9a-f]{40}$/i, 'gitHead must be a 40-character Git commit SHA.');

  const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')) as PackageManifest;
  assert.equal(typeof manifest.name, 'string', 'package.json must declare a package name.');
  assert.equal(typeof manifest.version, 'string', 'package.json must declare a package version.');
  assert.ok(Array.isArray(manifest.files), 'package.json must declare a files allowlist.');
  assert.ok(manifest.files.every((entry) => typeof entry === 'string'), 'Package file entries must be strings.');

  const temporaryRoot = await mkdtemp(join(tmpdir(), 'zdp-release-artifact-'));
  const stagingDirectory = join(temporaryRoot, 'package');
  await mkdir(stagingDirectory);

  try {
    for (const entry of manifest.files as string[]) {
      assertRelativePackagePath(entry);
      await cp(join(root, entry), join(stagingDirectory, entry), { recursive: true });
    }

    await writeFile(
      join(stagingDirectory, 'package.json'),
      `${JSON.stringify({ ...manifest, gitHead }, null, 2)}\n`,
      'utf8'
    );
    await mkdir(artifactDirectory, { recursive: true });

    const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const packed = spawnSync(
      npmExecutable,
      ['pack', '--json', '--pack-destination', artifactDirectory],
      { cwd: stagingDirectory, encoding: 'utf8', shell: false }
    );
    assert.equal(packed.status, 0, packed.stderr || 'npm pack failed.');

    const results = JSON.parse(packed.stdout) as PackResult[];
    assert.equal(results.length, 1, 'npm pack must create exactly one tarball.');
    const filename = results[0]?.filename;
    assert.ok(typeof filename === 'string', 'npm pack did not return a tarball filename.');
    assert.equal(basename(filename), filename, 'npm pack returned an unsafe filename.');

    const tarball = resolve(artifactDirectory, filename);
    assert.equal(relative(resolve(artifactDirectory), tarball), filename);
    const archive = await readFile(tarball);
    const integrity = `sha512-${createHash('sha512').update(archive).digest('base64')}`;
    assert.equal(results[0].integrity, integrity, 'npm pack integrity does not match the tarball bytes.');

    const packedManifest = JSON.parse(readTarEntry(archive, 'package/package.json').toString('utf8')) as PackageManifest;
    assert.equal(packedManifest.gitHead, gitHead, 'Packed package.json does not contain the release gitHead.');
    assert.equal(packedManifest.name, manifest.name, 'Packed package name changed.');
    assert.equal(packedManifest.version, manifest.version, 'Packed package version changed.');

    const releaseManifest = resolve(artifactDirectory, 'release-artifact.json');
    await writeFile(
      releaseManifest,
      `${JSON.stringify({
        schemaVersion: 'zdp.npm-release-artifact/v1',
        package: manifest.name,
        version: manifest.version,
        gitHead,
        tarball: filename,
        integrity
      }, null, 2)}\n`,
      'utf8'
    );

    return { tarball, integrity, manifest: releaseManifest };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

const args = process.argv.slice(2);
const checkOnly = args.length === 1 && args[0] === '--check';
const gitHeadIndex = args.indexOf('--git-head');
const githubOutputIndex = args.indexOf('--github-output');

if (checkOnly) {
  const checkDirectory = await mkdtemp(join(tmpdir(), 'zdp-release-artifact-check-'));
  try {
    await buildArtifact(checkGitHead, checkDirectory);
    console.log('Release artifact check passed.');
  } finally {
    await rm(checkDirectory, { recursive: true, force: true });
  }
} else {
  assert.ok(gitHeadIndex >= 0 && args[gitHeadIndex + 1], 'Missing --git-head value.');
  assert.ok(githubOutputIndex >= 0 && args[githubOutputIndex + 1], 'Missing --github-output value.');
  const { tarball, integrity, manifest } = await buildArtifact(args[gitHeadIndex + 1], root);
  await appendFile(
    args[githubOutputIndex + 1],
    `tarball=${basename(tarball)}\nintegrity=${integrity}\nmanifest=${basename(manifest)}\n`,
    'utf8'
  );
}
