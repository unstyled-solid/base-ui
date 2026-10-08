import { describe, expect, it, vi } from 'vitest';
import { createRenderer, flushMicrotasks } from '../../../test';
import { Drawer } from '../index';

// Canonical root CloseWatcher cases use an Android platform mock. Keep the
// platform setup local and restore the owning realm after every assertion.
describe('Drawer Android CloseWatcher', () => {
  const { render } = createRenderer();
  class Watcher extends EventTarget {
    static instances: Watcher[] = [];
    active = true;
    constructor() { super(); Watcher.instances.push(this); }
    destroy() { this.active = false; }
    requestClose(cancelable: boolean) {
      const event = new Event('cancel', { cancelable });
      this.dispatchEvent(event);
      if (!event.defaultPrevented) this.destroy();
      return event;
    }
  }
  async function android(run: () => Promise<void>) {
    const property = Object.getOwnPropertyDescriptor(window, 'CloseWatcher');
    const agent = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Android');
    Object.defineProperty(window, 'CloseWatcher', { configurable: true, value: Watcher });
    Watcher.instances = [];
    try { await run(); }
    finally { agent.mockRestore(); if (property) Object.defineProperty(window, 'CloseWatcher', property); else Reflect.deleteProperty(window, 'CloseWatcher'); }
  }
  it('honors a canceled request on the same watcher, then accepts a later close', async () => android(async () => {
    let cancel = true;
    const change = vi.fn((_: boolean, details: Drawer.Root.ChangeEventDetails) => { if (cancel) details.cancel(); });
    const view = await render(() => <Drawer.Root defaultOpen modal={false} onOpenChange={change} />);
    const watcher = Watcher.instances.at(-1)!;
    expect(watcher).toBeDefined();
    expect(watcher.requestClose(true).defaultPrevented).toBe(true);
    await flushMicrotasks();
    expect(watcher.active).toBe(true);
    expect(Watcher.instances).toEqual([watcher]);
    cancel = false;
    watcher.requestClose(true);
    await flushMicrotasks();
    expect(change).toHaveBeenCalledTimes(2);
    expect(change).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'close-watcher' }));
    expect(watcher.active).toBe(false);
    view.unmount();
  }));
  it('ignores cancellation of a non-cancelable back request and disposes the watcher', async () => android(async () => {
    const change = vi.fn((_: boolean, details: Drawer.Root.ChangeEventDetails) => details.cancel());
    const view = await render(() => <Drawer.Root defaultOpen modal={false} onOpenChange={change} />);
    const watcher = Watcher.instances.at(-1)!;
    watcher.requestClose(false);
    await flushMicrotasks();
    expect(change).toHaveBeenCalledWith(false, expect.objectContaining({ isCanceled: false }));
    expect(watcher.active).toBe(false);
    view.unmount();
  }));
  it('keeps only the topmost open drawer watching and destroys it on unmount', async () => android(async () => {
    const view = await renderProps((props: { child: boolean }) => <Drawer.Root defaultOpen modal={false}>
      <Drawer.Root open={props.child} modal={false} />
    </Drawer.Root>, { child: false });
    expect(Watcher.instances.filter(item => item.active)).toHaveLength(1);
    await view.setProps({ child: true });
    expect(Watcher.instances.filter(item => item.active)).toHaveLength(1);
    view.unmount();
    expect(Watcher.instances.filter(item => item.active)).toHaveLength(0);
  }));
  const { renderProps } = createRenderer();
});
