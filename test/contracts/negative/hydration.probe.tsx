import { it } from 'vitest';

// Test the console policy itself, independently of renderer recovery behavior.
// Real separately compiled hydration is covered by the browser fixture matrix.
it('rejects an unapproved hydration warning even without a structured diagnostic code', () => {
  console.warn('Hydration key miss for "negative-policy-probe": no server-rendered element carries this key');
});
