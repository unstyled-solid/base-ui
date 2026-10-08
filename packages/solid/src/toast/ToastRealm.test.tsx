import { expect, it, vi } from 'vitest';
import { For, flush } from 'solid-js';
import { createRenderer, waitFor } from '../../test';
import { Toast } from './index';
// Source: ToastViewport.test.tsx#rebinds owner-document listeners once across empty store cycles.
it('Toast rebinds owner-document listeners once across empty store cycles', async () => {
  const iframe = document.createElement('iframe'); document.body.append(iframe);
  const win = iframe.contentWindow!, doc = iframe.contentDocument!;
  const container = doc.createElement('div'); doc.body.append(container);
  const addWindow = vi.spyOn(win, 'addEventListener'), removeWindow = vi.spyOn(win, 'removeEventListener');
  const addDocument = vi.spyOn(doc, 'addEventListener'), removeDocument = vi.spyOn(doc, 'removeEventListener');
  const manager = Toast.createToastManager();
  function List() { const local = Toast.useToastManager(); return <For each={local.toasts} keyed={(toast) => toast.id}>{(toast) => <Toast.Root toast={toast()}><Toast.Title /></Toast.Root>}</For>; }
  const { render } = createRenderer();
  try {
    const view = await render(() => <Toast.Provider timeout={0} toastManager={manager}><Toast.Portal container={container}><Toast.Viewport data-testid="alternate"><List /></Toast.Viewport></Toast.Portal></Toast.Provider>);
    for (let cycle = 1; cycle <= 2; cycle++) {
      manager.add({ id: 'a', title: 'Title' }); flush();
      await waitFor(() => expect(doc.querySelector('[role="dialog"]')).not.toBeNull());
      for (const type of ['keydown', 'blur', 'focus']) expect(addWindow.mock.calls.filter(([event]) => event === type)).toHaveLength(cycle);
      expect(addDocument.mock.calls.filter(([event]) => event === 'pointerdown')).toHaveLength(cycle);
      // Nonempty updates and measurements must not rebind the realm listeners.
      manager.update('a', { title: 'Updated' }); flush();
      expect(addWindow.mock.calls.filter(([event]) => event === 'keydown')).toHaveLength(cycle);
      const keyboard = doc.createEvent('Event'); keyboard.initEvent('keydown', true, true); Object.defineProperty(keyboard, 'key', { value: 'F6' }); win.dispatchEvent(keyboard); flush();
      expect(doc.activeElement === doc.querySelector('[data-testid="alternate"]')).toBe(true);
      manager.close('a'); flush(); await waitFor(() => expect(doc.querySelector('[role="dialog"]')).toBeNull());
      for (const type of ['keydown', 'blur', 'focus']) expect(removeWindow.mock.calls.filter(([event]) => event === type)).toHaveLength(cycle);
      expect(removeDocument.mock.calls.filter(([event]) => event === 'pointerdown')).toHaveLength(cycle);
    }
    view.unmount();
  } finally { addWindow.mockRestore(); removeWindow.mockRestore(); addDocument.mockRestore(); removeDocument.mockRestore(); iframe.remove(); }
});
