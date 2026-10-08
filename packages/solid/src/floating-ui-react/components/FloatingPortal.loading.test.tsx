import { expect, it } from 'vitest';
import { createContext, lazy, Loading, onSettled, useContext } from 'solid-js';
import { createRenderer } from '../../../test';
import { Dialog } from '../../dialog';

// React source: dialog/portal/DialogPortal.test.tsx:33-70, outer Suspense.
// Also exercise the native render-provider owner, not just a default host.
for (const custom of [false, true]) {
  it.each([true, false])(`outer Loading reveals one owned Dialog portal, custom render=${custom}, modal=%s`, async modal => {
    const Context = createContext<{ readonly message: string }>();
    let mounts = 0, disposals = 0;
    function Content() {
      const context = useContext(Context);
      mounts++;
      onSettled(() => () => { disposals++; });
      return <><p>{context.message}</p><Dialog.Close>Close async popup</Dialog.Close></>;
    }
    let resolve!: (module: { default: typeof Content }) => void;
    const promise = new Promise<{ default: typeof Content }>(done => { resolve = done; });
    const Async = lazy(() => promise);
    const view = await createRenderer().renderProps((props: { message: string }) => <Loading fallback="Loading…">
      <Context value={{ get message() { return custom ? 'Wrong outer owner' : props.message; } }}>
        <Dialog.Root open modal={modal}><Dialog.Portal><Dialog.Popup
          render={custom ? attributes => <Context value={{ get message() { return props.message; } }}><section {...attributes} /></Context> : undefined}
        ><Async /></Dialog.Popup></Dialog.Portal></Dialog.Root>
      </Context>
    </Loading>, { message: 'Greetings' });
    expect(await view.findByText('Loading…')).toBeInTheDocument();
    expect(view.queryByText('Greetings')).toBeNull();
    resolve({ default: Content });
    const greeting = await view.findByText('Greetings');
    expect(view.queryByText('Loading…')).toBeNull();
    expect(view.getAllByRole('dialog')).toHaveLength(1);
    const popup = view.getByRole('dialog');
    expect(popup.closest('[data-base-ui-portal]')?.parentElement).toBe(document.body);
    expect(mounts).toBe(1);
    await view.setProps({ message: 'Updated context' });
    expect(view.getByText('Updated context')).toBe(greeting);
    expect(view.getByRole('dialog')).toBe(popup);
    expect(mounts).toBe(1);
    view.unmount();
    expect(disposals).toBe(1);
    expect(popup.isConnected).toBe(false);
    expect(document.querySelector('[data-base-ui-portal]')).toBeNull();
  });
}
