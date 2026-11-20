import { createMemo, createRoot, createSignal, flush } from 'solid-js';
import { expect, it, vi } from 'vitest';
import { withAttributionBudget } from './diagnostics';

const budget = { reason: 'Harness policy regression', maxCreates: 10, maxReruns: 10, maxRerunsPerScope: 10 };

it('reports a real time diagnostic while enforcing deterministic work budgets', async () => {
  // Advance only the measured compute span, not real CPU time. This proves the
  // actual runtime diagnostic path without making a clock-sensitive slow test.
  let time = 0;
  const clock = vi.spyOn(performance, 'now').mockImplementation(() => time);
  const report = vi.spyOn(console, 'info');
  try {
    const result = await withAttributionBudget(budget, () => {
      const model = createRoot(dispose => {
          const [value, setValue] = createSignal(0);
          const memo = createMemo(() => { const next = value(); time += 9; return next; });
          void memo();
          return { dispose, setValue, memo };
      });
      try { model.setValue(1); flush(); expect(model.memo()).toBe(1); }
      finally { model.dispose(); }
    });
    expect(result.timings.map(event => event.code)).toEqual(['HOT_SCOPE_TIME']);
    expect(result.reruns).toBe(1);
    expect(result.maxRerunsPerScope).toBe(1);
    expect(report.mock.calls.some(args => args[0] === '[HARNESS_ATTRIBUTION_TIMING]')).toBe(true);
  } finally { clock.mockRestore(); report.mockRestore(); }
});

it.each([
  ['maxCreates', 'ATTRIBUTION_CREATE_BUDGET'],
  ['maxReruns', 'ATTRIBUTION_RERUN_BUDGET'],
  ['maxRerunsPerScope', 'ATTRIBUTION_SCOPE_BUDGET'],
] as const)('rejects excessive work: %s', async (limit, marker) => {
  await expect(withAttributionBudget({ ...budget, [limit]: 0 }, () => {
    const model = createRoot(dispose => {
        const [value, setValue] = createSignal(0);
        const memo = createMemo(value);
        void memo();
        return { dispose, setValue, memo };
    });
    try { model.setValue(1); flush(); expect(model.memo()).toBe(1); }
    finally { model.dispose(); }
  })).rejects.toThrow(marker);
});
