import { resolve } from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const config = ts.readConfigFile(resolve(root, 'tsconfig.json'), ts.sys.readFile);
if (config.error) {
  throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
}

const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram({
  rootNames: [resolve(root, 'tests/package-types.ts'), resolve(root, 'tests/package-message-parity.ts')],
  options: { ...parsed.options, noEmit: true }
});
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
if (diagnostics.length > 0) {
  const host: ts.FormatDiagnosticsHost = {
    getCanonicalFileName: (file) => file,
    getCurrentDirectory: () => root,
    getNewLine: () => '\n'
  };
  throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, host));
}

process.stdout.write('Published package i18n declarations typecheck and match the source catalog.\n');
