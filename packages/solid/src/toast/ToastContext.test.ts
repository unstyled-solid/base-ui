import { createRoot } from 'solid-js';
import { describe, expect, it } from 'vitest';
import { useToastProviderContext } from './provider/ToastProviderContext';
import { useToastRootContext } from './root/ToastRootContext';
import { useToastPositionerContext } from './positioner/ToastPositionerContext';

// Source missing-provider cases use RC13's required-context error instead of
// React's null-sentinel message. No swallowed context failures or shared default.
describe('Toast required context boundaries', () => {
  for (const [name, consume] of [
    ['Provider (manager/viewport/root/positioner)', useToastProviderContext],
    ['Root (title/description/content/action/close)', useToastRootContext],
    ['Positioner (arrow)', useToastPositionerContext],
  ] as const) it(`rejects missing ${name}`, () => {
    createRoot((dispose) => {
      try { expect(() => consume()).toThrow(); } finally { dispose(); }
    });
  });
});
