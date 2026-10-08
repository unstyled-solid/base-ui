import { describe, expect, it } from 'vitest';
import { isServer, renderToString } from '@solidjs/web';
import { ToastProvider } from './provider/ToastProvider';
import { useToastManager } from './useToastManager';
import { createToastManager } from './createToastManager';
import { Toast } from './index';

describe('Toast server owner isolation', () => {
  it('renders an empty provider without listeners, timers or writes', () => {
    expect(isServer).toBe(true);
    function Probe() { const manager = useToastManager(); return <output>{manager.toasts.length}</output>; }
    const external = createToastManager();
    const first = renderToString(() => <ToastProvider toastManager={external}><Probe /></ToastProvider>);
    const second = renderToString(() => <ToastProvider><Probe /></ToastProvider>);
    expect(first).toContain('0'); expect(second).toContain('0');
    // A server render never subscribes a disposed provider to the external manager.
    external.add({ title: 'After rendering' });
    expect(renderToString(() => <ToastProvider toastManager={external}><Probe /></ToastProvider>)).toContain('0');
  });
  it('serializes static parts and fallbacks without client label registration or portal DOM', () => {
    const html = renderToString(() => <Toast.Provider>
      <Toast.Viewport>
        <Toast.Root toast={{ id: 'static', title: 'Title', description: 'Description', type: 'success' }}>
          <Toast.Content><Toast.Title /><Toast.Description /><Toast.Action>Undo</Toast.Action><Toast.Close>Close</Toast.Close></Toast.Content>
        </Toast.Root>
      </Toast.Viewport>
      <Toast.Portal>Client only</Toast.Portal>
    </Toast.Provider>);
    expect(html).toContain('role="region"'); expect(html).toContain('role="dialog"'); expect(html).toContain('data-type="success"');
    expect(html).toContain('Title'); expect(html).toContain('Description'); expect(html).toContain('Undo');
    expect(html).not.toContain('aria-labelledby'); expect(html).not.toContain('aria-describedby'); expect(html).not.toContain('Client only');
  });
  it('serializes anchored Positioner/Arrow source defaults without measuring', () => {
    const html = renderToString(() => <Toast.Provider>
      <Toast.Positioner toast={{ id: 'static', positionerProps: { align: 'end' } }}>
        <Toast.Arrow />
      </Toast.Positioner>
    </Toast.Provider>);
    expect(html).toContain('role="presentation"'); expect(html).toContain('data-side="top"'); expect(html).toContain('data-align="end"'); expect(html).toContain('aria-hidden="true"');
  });
});
