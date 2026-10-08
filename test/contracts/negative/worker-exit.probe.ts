import { it } from 'vitest';

it('HARNESS_WORKER_EXIT_PROBE', () => { process.kill(process.pid, 'SIGKILL'); });
