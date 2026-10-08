import { afterEach, expect, it } from 'vitest';
import { flush } from 'solid-js';
import { attribution } from 'solid-js/attribution';
import { mountContextProbe } from './context';

let probe: ReturnType<typeof mountContextProbe> | undefined;
afterEach(() => {
  attribution.disable();
  probe?.dispose();
  probe = undefined;
});

it('does not execute lazy JSX getters when a memo record updates', () => {
  probe = mountContextProbe(document.createElement('div'));
  probe.update();
  flush();
  expect(probe.evidence()).toEqual({ reads: 0, stacks: [] });
});

it('preserves that contract with Vite development attribution enabled', () => {
  attribution.enable();
  probe = mountContextProbe(document.createElement('div'));
  probe.update();
   // Unpatched RC13 throws from attribution.shallowEquivalent before this
   // assertion. The pnpm patch must preserve ownerless diagnostic inspection.
  flush();
  expect(probe.evidence()).toEqual({ reads: 0, stacks: [] });
});
