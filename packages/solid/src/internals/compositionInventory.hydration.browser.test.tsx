import { expect, it } from 'vitest';
import { isNativeDocumentLane } from '../../test/nativeDocument';
import { hydrate } from '@solidjs/web';
import { commands, userEvent } from 'vitest/browser';
import { browserCase } from '../../test';
import { compositionCases, compositionHostClaims, CompositionInventoryFixture } from '../../../../test/harness/CompositionInventoryFixture';
import { captureAllocations, runtimeAllocationDivergence, type RuntimeAllocation } from '../../../../test/harness/allocationTrace';

for (const part of compositionCases) {
  if (part.id === 'NumberField.ScrubAreaCursor' && !isNativeDocumentLane()) {
    it.skip('[native-document] inventory NumberField.ScrubAreaCursor requires real pointer lock');
    continue;
  }
  browserCase({ source: 'packages/react/src/internals/useRenderElement.test.tsx', case: `inventory ${part.id} component composition`, environment: 'browser', issue: 'https://github.com/unstyled-solid/base-ui/issues/15' }, async () => {
    const renderId = `inventory-${part.id.replaceAll('.', '-')}-`;
    const query = new URLSearchParams({ module: 'test/harness/CompositionInventoryFixture.tsx', export: 'CompositionInventoryFixture', props: JSON.stringify({ id: part.id }), renderId, traceAllocations: '1' });
    const response = await fetch(`/__harness__/ssr.html?${query}`);
    const html = await response.text();
    expect(response.ok, html).toBe(true);
    const template = document.createElement('template'); template.innerHTML = html;
    const previous = globalThis._$HY;
    const serverTrace = JSON.parse(template.content.querySelector('[data-allocation-trace]')!.textContent!) as RuntimeAllocation[];
    for (const script of template.content.querySelectorAll('script:not([type="application/json"])')) new Function(script.textContent ?? '')();
    const root = template.content.querySelector('main')!; document.body.append(root);
    const selector = `[data-inventory-host="${part.id}"]`;
    const original = root.querySelector(selector);
    if (!part.clientMounted) expect(original).not.toBeNull();
    const originalId = original?.id;
    let dispose: (() => void) | undefined;
    const requestPointerLock = Element.prototype.requestPointerLock;
    let pointerLockError = '';
    try {
      const trace = captureAllocations();
      compositionHostClaims.length = 0;
      try { dispose = hydrate(() => <CompositionInventoryFixture id={part.id} />, root, { renderId }); }
      finally { trace.stop(); }
      expect(serverTrace.length).toBeGreaterThan(0);
      expect(trace.points.length).toBeGreaterThan(0);
      const divergence = runtimeAllocationDivergence(serverTrace, trace.points);
      // The Button fixture has no client-only portal or dynamic-text tail.
      // Other recipes retain the full trace as first-divergence evidence for
      // failed host claims; client-only subtree allocations are not SSR slots.
      if (part.id === 'Button') expect(divergence).toBeNull();
      if (part.id === 'NumberField.ScrubAreaCursor') {
        await commands.prepareNativeDocument();
        Element.prototype.requestPointerLock = function (options) {
          const result = requestPointerLock.call(this, options);
          return Promise.resolve(result).catch(error => { pointerLockError = String(error); throw error; });
        };
        await commands.compositionPointer('down', '[data-inventory-part="ScrubArea"]');
        await expect.poll(() => pointerLockError || (document.pointerLockElement ? 'granted' : 'pending'), { message: 'Native pointer-lock request result' }).toBe('granted');
        await commands.compositionPointer('move', '[data-inventory-part="ScrubArea"]');
      }
      await expect.poll(() => document.querySelector(selector)).not.toBeNull();
      const host = document.querySelector(selector)!;
      if (!part.clientMounted) {
        expect(compositionHostClaims[0], divergence ?? undefined).toBe(original);
        // Upstream Content renders an inline crawler fallback, then replaces
        // that branch with createPortal (NavigationMenuContent.tsx:143-174).
        // Verify the initial hydration claim separately from that intentional
        // post-hydration remount, including the nested Link.
        if (['NavigationMenu.Content', 'NavigationMenu.Link'].includes(part.id)) {
          expect(original!.isConnected).toBe(false);
          expect(host).not.toBe(original);
        } else expect(host, divergence ?? undefined).toBe(original);
        expect(host.id).toBe(originalId);
      }
      // A portal container surrounds independent popup hit targets. Exercise
      // its own native event surface rather than clicking a child at its center.
      if (part.id.endsWith('.Portal') || part.id.endsWith('.Backdrop') || ['Slider.Indicator', 'Slider.Thumb', 'Slider.Track', 'NumberField.ScrubAreaCursor', 'Toast.Content', 'Toast.Description', 'Toast.Title', 'NavigationMenu.Popup', 'NavigationMenu.Positioner', 'NavigationMenu.Viewport', 'Combobox.Chip', 'Combobox.Chips', 'Combobox.Popup', 'Select.Label'].includes(part.id)) host.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      else await userEvent.click(host);
      if (part.id === 'Menu.Clear') {
        await expect.poll(() => document.querySelector(selector)).toBeNull();
        expect(root.querySelector('input')).toHaveValue('');
        return;
      }
      await expect.poll(() => host.getAttribute('data-inventory-revision')).toBe(part.id === 'NumberField.ScrubArea' ? '2' : '1');
      expect(document.querySelector(selector)).toBe(host);
    } finally {
      Element.prototype.requestPointerLock = requestPointerLock;
      if (part.id === 'NumberField.ScrubAreaCursor') await commands.compositionPointer('up', '');
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      dispose?.(); root.remove();
      if (previous === undefined) Reflect.deleteProperty(globalThis, '_$HY'); else globalThis._$HY = previous;
    }
  });
}
