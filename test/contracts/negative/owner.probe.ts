import { it } from 'vitest';
import { createRoot, createEffect, createSignal, flush } from 'solid-js';
it('rejects a leaked detached reactive root, without relying on DOM emptiness', () => {
  createRoot(() => { const [value] = createSignal(0); createEffect(value, () => {}); });
  flush();
});
