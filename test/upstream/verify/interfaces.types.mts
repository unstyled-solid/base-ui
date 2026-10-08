// NodeNext MJS consumer; checked independently by preflight with allowJs.
import { parseCli, executeCli } from '../../../scripts/upstream/cli.mjs';
import { runVerification } from '../../../scripts/upstream/verify/core.mjs';

const parsed = parseCli(['verify', '--evidence-path', 'proof.json', '--evidence-hash', 'a'.repeat(64)]);
const command: 'init' | 'update' | 'status' | 'abandon' | 'unlock' | 'verify' = parsed.command;
const source: 'base-ui' | 'solid-floating-ui' | undefined = parsed.source;
const advance: boolean | undefined = parsed.advance;
void [command, source, advance];
executeCli(['status']);
runVerification({ source: 'solid-floating-ui', evidencePath: 'proof.json', evidenceHash: 'a'.repeat(64), advance: false });
// @ts-expect-error A truthy string must not request state advancement.
runVerification({ advance: 'true' });
// @ts-expect-error Source adapters are independent, explicit selectors.
runVerification({ source: 'all' });
// @ts-expect-error Evidence hashes are strings, not numeric SHAs.
runVerification({ evidenceHash: 42 });
// @ts-expect-error CLI argument vectors contain strings only.
parseCli(['verify', true]);
