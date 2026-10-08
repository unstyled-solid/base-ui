// Node-side source qualification inventory; exclude *.node.test.* from DOM browser bundling.
import { describe, expect, it } from 'vitest';
import { inventoryDrawerSource, DRAWER_SOURCE_SHA } from './sourceInventory';

describe('Drawer pinned source inventory (ownership, not parity)', () => {
  const cases = inventoryDrawerSource(process.cwd());
  it('retains every recursive source test/spec file and generated conformance declaration', () => {
    expect(DRAWER_SOURCE_SHA).toBe('19511bb171f3b360b006c94cf6d07e53cb446505');
    expect(new Set(cases.map(item => item.source)).size).toBe(12);
    expect(cases.filter(item => item.title === 'generated conformance cases').length).toBe(4);
    expect(cases.filter(item => item.declaration !== 'type assertions' && item.title !== 'generated conformance cases').length).toBe(263);
  });
  it('retains parameter expressions and browser restrictions rather than relabeling them as jsdom passes', () => {
    expect(cases.some(item => item.parameters.length > 0)).toBe(true);
    expect(cases.filter(item => item.source.includes('virtual-keyboard-provider') && item.browserRestricted).length).toBe(65);
    for (const item of cases) {
      expect(item.stage).toMatch(/^bsolid-c-drawer(?:-gestures|-keyboard)?$/);
      expect(item.targetSuite).not.toBe('');
      expect(item.reconciliation).toBe('pending');
    }
  });
});
