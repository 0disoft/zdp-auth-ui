import { readdir, readFile, writeFile } from 'node:fs/promises';
import ts from 'typescript';

/**
 * SvelteKit development SSR renders consumer markup inside library component
 * slots. Svelte's dev-mode `push_element` reads `ssr_context.function` from the
 * component boundary that owns the current render. Production library builds
 * compiled with `dev: false` emit `$$renderer.component(fn)` without the
 * component identity argument, leaving that context empty and crashing dev SSR
 * whenever the slot contains an HTML element.
 *
 * This post-processor rewrites each one-argument `$$renderer.component(fn)`
 * boundary in the built server bundle to `$$renderer.component(fn, Component)`
 * so the consuming application's dev-mode SSR runtime can resolve the boundary.
 */

interface ServerComponentBoundary {
  readonly componentName: string;
  readonly index: number;
}

function isBoundaryCall(node: ts.CallExpression): boolean {
  if (node.arguments.length !== 1) return false;
  const expression = node.expression;
  if (!ts.isPropertyAccessExpression(expression) || expression.name.text !== 'component') {
    return false;
  }
  const firstArgument = node.arguments[0];
  if (firstArgument === undefined) return false;
  return ts.isArrowFunction(firstArgument) || ts.isFunctionExpression(firstArgument);
}

function collectBoundaries(
  source: string,
  sourceFile: ts.SourceFile
): ServerComponentBoundary[] {
  const boundaries: ServerComponentBoundary[] = [];

  function visit(node: ts.Node): void {
    if (ts.isFunctionDeclaration(node) && node.name !== undefined && node.body !== undefined) {
      const componentName = node.name.text;
      forEachBoundaryCall(node.body, (call) => {
        const firstArgument = call.arguments[0];
        if (firstArgument !== undefined) {
          boundaries.push({ componentName, index: firstArgument.getEnd() });
        }
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return boundaries;
}

function forEachBoundaryCall(node: ts.Node, callback: (call: ts.CallExpression) => void): void {
  if (ts.isCallExpression(node) && isBoundaryCall(node)) {
    callback(node);
  }
  ts.forEachChild(node, (child) => forEachBoundaryCall(child, callback));
}

async function preserveBundle(serverBundlePath: string): Promise<void> {
  const source = await readFile(serverBundlePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    serverBundlePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS
  );

  const boundaries = collectBoundaries(source, sourceFile);
  if (boundaries.length === 0) {
    process.stdout.write('preserve-server-component-identity: no component boundaries found\n');
    return;
  }

  // Apply from the end so earlier insertion indexes stay valid.
  let transformed = source;
  for (const boundary of [...boundaries].reverse()) {
    transformed =
      transformed.slice(0, boundary.index) +
      `, ${boundary.componentName}` +
      transformed.slice(boundary.index);
  }

  const guardSourceFile = ts.createSourceFile(
    serverBundlePath,
    transformed,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS
  );
  const remaining = collectBoundaries(transformed, guardSourceFile);
  if (remaining.length > 0) {
    throw new Error(
      `preserve-server-component-identity: ${remaining.length} one-argument component boundaries remain`
    );
  }

  await writeFile(serverBundlePath, transformed, 'utf8');
  process.stdout.write(
    `preserve-server-component-identity: rewrote ${boundaries.length} component boundaries\n`
  );
}

async function main(): Promise<void> {
  for (const file of await readdir('dist')) {
    if (file.endsWith('.server.js')) await preserveBundle(`dist/${file}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
