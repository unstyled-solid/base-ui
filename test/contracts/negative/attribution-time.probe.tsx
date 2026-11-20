import { createMemo, createRoot, createSignal, flush } from 'solid-js';
import { attribution } from 'solid-js/attribution';
import { it, vi } from 'vitest';

it('still rejects unscoped HOT_SCOPE_TIME', () => {
  let time = 0;
  const clock = vi.spyOn(performance, 'now').mockImplementation(() => time);
  const release = attribution.enable({ log: false });
  try {
    const model = createRoot(dispose => {
        const [value, setValue] = createSignal(0);
        const memo = createMemo(() => { const next = value(); time += 9; return next; });
        void memo();
        return { dispose, setValue, memo };
    });
    try { model.setValue(1); flush(); void model.memo(); }
    finally { model.dispose(); }
  } finally { release(); clock.mockRestore(); }
});
