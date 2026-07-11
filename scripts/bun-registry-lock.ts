import { Buffer } from 'node:buffer';

export interface BunRegistryLockEntry {
  readonly packageName: string;
  readonly version: string;
  readonly integrity: string;
}

interface StableSemver {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}

export function readBunRegistryLockEntry(
  lockSource: string,
  packageName: string
): BunRegistryLockEntry {
  const entryPrefix = `"${packageName}": [`;
  const matchingLines = lockSource
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith(entryPrefix));

  if (matchingLines.length !== 1) {
    throw new Error(
      `bun.lock must contain exactly one registry entry for ${packageName}; found ${matchingLines.length}.`
    );
  }

  const propertySource = matchingLines[0].replace(/,$/, '');
  let parsedProperty: unknown;

  try {
    parsedProperty = JSON.parse(`{${propertySource}}`);
  } catch (error) {
    throw new Error(
      `bun.lock registry entry for ${packageName} is not valid JSON-shaped lock data: ${errorMessage(error)}`
    );
  }

  if (!isRecord(parsedProperty)) {
    throw new Error(`bun.lock registry entry for ${packageName} must parse as an object.`);
  }

  const entry = parsedProperty[packageName];
  if (!Array.isArray(entry) || entry.length < 4) {
    throw new Error(`bun.lock registry entry for ${packageName} must use Bun's package tuple shape.`);
  }

  const locator = entry[0];
  const integrity = entry[3];
  const locatorPrefix = `${packageName}@`;

  if (typeof locator !== 'string' || !locator.startsWith(locatorPrefix)) {
    throw new Error(`bun.lock registry entry for ${packageName} has an invalid package locator.`);
  }

  const version = locator.slice(locatorPrefix.length);
  parseStableSemver(version, `${packageName} lock version`);
  assertSha512Integrity(integrity, packageName);

  return { packageName, version, integrity };
}

export function assertVersionSatisfiesCaretRange(
  version: string,
  range: string,
  packageName: string
): void {
  if (!range.startsWith('^')) {
    throw new Error(`${packageName} must use an explicit caret range; received ${range}.`);
  }

  const candidate = parseStableSemver(version, `${packageName} resolved version`);
  const minimum = parseStableSemver(range.slice(1), `${packageName} declared range`);

  if (compareSemver(candidate, minimum) < 0 || !isInsideCaretLine(candidate, minimum)) {
    throw new Error(`${packageName}@${version} does not satisfy declared range ${range}.`);
  }
}

function assertSha512Integrity(integrity: unknown, packageName: string): asserts integrity is string {
  if (typeof integrity !== 'string' || !/^sha512-[A-Za-z0-9+/]+={0,2}$/.test(integrity)) {
    throw new Error(`bun.lock registry entry for ${packageName} must include sha512 integrity.`);
  }

  const digest = Buffer.from(integrity.slice('sha512-'.length), 'base64');
  if (digest.byteLength !== 64) {
    throw new Error(`bun.lock registry entry for ${packageName} must contain a 64-byte sha512 digest.`);
  }
}

function parseStableSemver(value: string, label: string): StableSemver {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(value);
  if (match === null) {
    throw new Error(`${label} must be a stable semantic version; received ${value}.`);
  }

  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function compareSemver(left: StableSemver, right: StableSemver): number {
  return left.major - right.major || left.minor - right.minor || left.patch - right.patch;
}

function isInsideCaretLine(candidate: StableSemver, minimum: StableSemver): boolean {
  if (minimum.major > 0) {
    return candidate.major === minimum.major;
  }

  if (minimum.minor > 0) {
    return candidate.major === 0 && candidate.minor === minimum.minor;
  }

  return candidate.major === 0 && candidate.minor === 0 && candidate.patch === minimum.patch;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
