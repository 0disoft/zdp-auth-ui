import {
  checkAuthHandoffRegistryGeneratedFiles,
  generateAuthHandoffRegistryFiles
} from './auth-handoff-registry-generation';

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
  throw new Error('Usage: bun scripts/generate-auth-handoff-registry.ts [--check]');
}

if (args[0] === '--check') {
  await checkAuthHandoffRegistryGeneratedFiles();
  console.log('Auth handoff registry generated files are current.');
} else {
  const changedPaths = await generateAuthHandoffRegistryFiles();
  console.log(
    changedPaths.length > 0
      ? `Generated auth handoff registry files: ${changedPaths.join(', ')}`
      : 'Auth handoff registry generated files are already current.'
  );
}
