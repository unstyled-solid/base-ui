import { runUpstream } from './git/workflow.mjs';
import { runVerification } from './verify/core.mjs';
import { fail } from './git/state.mjs';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const usage = `Usage: node scripts/upstream/cli.mjs <init|update|status|abandon|unlock|verify> [options]
  --source base-ui|solid-floating-ui  Independent source (default: base-ui)
  --root <repository>                Default: current working directory
  --reason <explanation>             Required to abandon an active episode
  --token <lock-token>               Required to unlock a dead local process
  --evidence-path <relative-file>    Required for verify; exact immutable evidence bundle
  --evidence-hash <sha256>           Required for verify; 64 lowercase hexadecimal characters
  --advance                         Verify only: request advancement after live coordinator approval
  --json                            Output is always JSON; accepted for scripts
  --no-watch                        Accepted for one-shot package scripts

init restores a missing submodule at its source-policy pin; existing work is never reset.
update initializes a fresh clone and fetches its recorded branch. Active batches queue later SHAs.
Base UI checks out candidates; solid-floating-ui retains baseline HEAD for object-only inspection.
abandon restores the prior candidate state, preserving reports, source-policy pin and parity.
After interruption, repeat init/update/abandon to resume the durable transaction first.
status never fetches or writes. verify is check-only by default and never fetches.
verify --advance requires all exact evidence, closed prerequisites and live exact-hash approval.
All spawned Git commands use rtk proxy. No commits, stage operations or publication.
`;

/** @typedef {'init'|'update'|'status'|'abandon'|'unlock'|'verify'} Command */
/**
 * @typedef {object} CliOptions
 * @property {Command} command
 * @property {string} [root]
 * @property {'base-ui'|'solid-floating-ui'} [source]
 * @property {string} [reason]
 * @property {string} [token]
 * @property {string} [evidencePath]
 * @property {string} [evidenceHash]
 * @property {boolean} [advance]
 */
const commands = ['init', 'update', 'status', 'abandon', 'unlock', 'verify'];
const common = ['--source', '--root', '--json', '--no-watch'];
const specific = { init: [], update: [], status: [], abandon: ['--reason'], unlock: ['--token'],
  verify: ['--evidence-path', '--evidence-hash', '--advance'] };

/** @param {string[]} argv @returns {CliOptions} */
export function parseCli(argv) {
  const args = [...argv];
  const command = /** @type {Command} */ (args.shift() ?? 'status');
  if (!commands.includes(command)) fail('UNKNOWN_COMMAND', `Unknown command ${command}.\n${usage}`);
  /** @type {CliOptions} */
  const options = { command };
  const seen = new Set();
  while (args.length) {
    const option = args.shift();
    if (![...common, ...specific[command]].includes(option) || seen.has(option)) {
      fail('INVALID_OPTIONS', `Unknown, command-inapplicable or repeated option ${option}.\n${usage}`);
    }
    seen.add(option);
    if (option === '--json' || option === '--no-watch') continue;
    if (option === '--advance') { options.advance = true; continue; }
    const value = args.shift();
    if (!value || value.startsWith('-') || /[\x00-\x1f]/.test(value)) fail('INVALID_OPTIONS', `Missing/unsafe value for ${option}.`);
    const name = { '--evidence-path': 'evidencePath', '--evidence-hash': 'evidenceHash' }[option] ?? option.slice(2);
    options[name] = value;
  }
  if (options.source && !['base-ui', 'solid-floating-ui'].includes(options.source)) fail('UNKNOWN_SOURCE', `Unknown source ${options.source}.`);
  if (command === 'verify') {
    if (!options.evidencePath || !options.evidenceHash) fail('MISSING_EVIDENCE', 'verify requires --evidence-path and --evidence-hash.');
    const path = options.evidencePath;
    if (isAbsolute(path) || path.includes('\\') || path.split('/').some((part) => !part || part === '.' || part === '..')) {
      fail('UNSAFE_PATH', 'Evidence path must be a safe repository-relative file.');
    }
    if (!/^[a-f0-9]{64}$/.test(options.evidenceHash)) fail('INVALID_OPTIONS', 'Evidence hash must be a full lowercase SHA-256.');
    options.advance ??= false;
  }
  return options;
}

/** @param {string[]} argv */
export function executeCli(argv, { upstream = runUpstream, verify = runVerification } = {}) {
  const { command, ...options } = parseCli(argv);
  // Core owns the lock. No recovery, fetch or alternate fixture adapter is exposed
  // through executable CLI options. Dependency injection is import-only for tests.
  return command === 'verify' ? verify(options) : upstream({ command, ...options });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const help = args.length === 1 && ['--help', '-h'].includes(args[0]) ||
      args.length === 2 && commands.includes(args[0]) && ['--help', '-h'].includes(args[1]);
    if (help) process.stdout.write(usage);
    else process.stdout.write(`${JSON.stringify(executeCli(args), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ error: error.code ?? 'UPSTREAM_ERROR', message: error.message })}\n`);
    process.exitCode = 1;
  }
}
