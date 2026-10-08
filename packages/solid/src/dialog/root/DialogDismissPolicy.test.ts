import { describe, it, expect } from 'vitest';
import { isDialogOutsidePress } from './useDialogRoot';
import type { DialogStore } from '../store/DialogStore';

/** Tests only the family-owned predicate. Shared gesture observation is tested by real Dialog fixtures. */
function policyFixture(options: { modal?: boolean | 'trap-focus'; nested?: number; disabled?: boolean; enabled?: boolean; backdrop?: HTMLElement | null; internal?: HTMLElement | null; popup?: HTMLElement | null }) {
  return {
    state: { modal: options.modal ?? true, disablePointerDismissal: options.disabled ?? false, nestedOpenDialogCount: options.nested ?? 0, popupElement: options.popup ?? null },
    context: { outsidePressEnabledRef: { current: options.enabled ?? true }, backdropRef: () => options.backdrop ?? null, internalBackdropRef: () => options.internal ?? null },
  } as unknown as DialogStore;
}
function mouse(target: Element, button = 0) {
  const event = new MouseEvent('click', { button });
  Object.defineProperty(event, 'target', { value: target });
  return event;
}
function touch(ended: number, remaining: number) {
  const event = new Event('touchend');
  Object.defineProperties(event, { changedTouches: { value: { length: ended } }, touches: { value: { length: remaining } } });
  return event as TouchEvent;
}
describe('Dialog outside press policy', () => {
  for (const modal of [true, false, 'trap-focus'] as const) {
    it(`rejects secondary mouse buttons and dismissal vetoes (${modal})`, () => {
      const target = document.createElement('div');
      expect(isDialogOutsidePress(policyFixture({ modal }), mouse(target, 2))).toBe(false);
      expect(isDialogOutsidePress(policyFixture({ modal, disabled: true }), mouse(target))).toBe(false);
      expect(isDialogOutsidePress(policyFixture({ modal, enabled: false }), mouse(target))).toBe(false);
      expect(isDialogOutsidePress(policyFixture({ modal, nested: 1 }), mouse(target))).toBe(false);
    });
  }
  it('modal ownership accepts its backdrops and viewport but rejects other modal backdrops/portals', () => {
    const backdrop = document.createElement('div');
    const internal = document.createElement('div');
    const viewport = document.createElement('div');
    const popup = viewport.appendChild(document.createElement('div'));
    const store = policyFixture({ backdrop, internal, popup });
    expect(isDialogOutsidePress(store, mouse(backdrop))).toBe(true);
    expect(isDialogOutsidePress(store, mouse(internal))).toBe(true);
    expect(isDialogOutsidePress(store, mouse(viewport))).toBe(true);
    viewport.setAttribute('data-base-ui-portal', '');
    expect(isDialogOutsidePress(store, mouse(viewport))).toBe(false);
    expect(isDialogOutsidePress(store, mouse(document.createElement('div')))).toBe(false);
  });
  for (const [ended, remaining, allowed] of [[1, 0, true], [1, 1, false], [2, 0, false], [0, 0, false]] as const) {
    it(`touchend changedTouches=${ended}, touches=${remaining}`, () => {
      expect(isDialogOutsidePress(policyFixture({ modal: false }), touch(ended, remaining))).toBe(allowed);
    });
  }
});
