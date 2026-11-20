import { createEffect, createRoot, createSignal, flush } from 'solid-js';
import { it } from 'vitest';
import { withAttributionBudget } from '../../harness/diagnostics';

it('still rejects effect feedback inside a count-budgeted workload', async () => {
  await withAttributionBudget({ reason: 'Negative feedback probe', maxCreates: 20, maxReruns: 50, maxRerunsPerScope: 20 }, () => {
    const model = createRoot(dispose => {
        const [value, setValue] = createSignal(0);
        createEffect(value, next => { if (next % 2) setValue(next + 1); });
        return { dispose, setValue };
    });
    try {
        flush();
        for (const next of [1, 3, 5, 7]) { model.setValue(next); flush(); }
    } finally { model.dispose(); }
  });
});
