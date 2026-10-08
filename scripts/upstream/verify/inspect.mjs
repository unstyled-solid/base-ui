import { runVerification } from './core.mjs';

// Standalone entry is check-only. Advancement belongs to coordinator-reviewed CLI wiring.
try {
  const options = {};
  const args = process.argv.slice(2);
  while (args.length) {
    const key = args.shift();
    if (!['--root', '--source', '--evidence-path', '--evidence-hash'].includes(key)) throw new Error(`Unknown option ${key}.`);
    const name = { '--evidence-path': 'evidencePath', '--evidence-hash': 'evidenceHash' }[key] ?? key.slice(2);
    if (options[name] || !args.length || args[0].startsWith('--')) throw new Error(`Missing/repeated ${key}.`);
    options[name] = args.shift();
  }
  process.stdout.write(`${JSON.stringify(runVerification(options), null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${JSON.stringify({ error: error.code ?? 'VERIFY_ERROR', message: error.message })}\n`);
  process.exitCode = 1;
}
