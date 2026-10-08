import { describe, expect, it } from 'vitest';
import { createSignal, createMemo, Loading, onSettled, untrack, flush } from 'solid-js';
import { browserCase, createRenderer, waitFor, expectDiagnostic, advanceFrame, isJSDOM } from '../../../test';
import { vi } from 'vitest';
import { Dialog } from '../index';

const { render, renderProps } = createRenderer();
describe('Dialog detached handle ownership', () => {
  for (const initiallyAttached of [false, true]) {
    it(`source detached calls are ignored with fresh attach/remount state, initiallyAttached=${initiallyAttached}`, async () => {
      const handle = Dialog.createHandle<number>();
      const view = await renderProps((props: { mounted: boolean }) => <>
        <Dialog.Trigger handle={handle} id="trigger" payload={1}>Trigger</Dialog.Trigger>
        {props.mounted && <Dialog.Root handle={handle}>{(context) => <>
          <span data-testid="payload">{context.payload ?? 'No payload'}</span><Dialog.Portal><Dialog.Popup>Dialog Content</Dialog.Popup></Dialog.Portal>
        </>}</Dialog.Root>}
      </>, { mounted: initiallyAttached });
      if (initiallyAttached) {
        await view.user.click(view.getByText('Trigger'));
        expect(await view.findByRole('dialog')).toBeVisible();
        expect(view.getByTestId('payload').textContent).toBe('1');
        await view.setProps({ mounted: false });
        expect(view.queryByRole('dialog')).toBeNull();
      }
      const calls = initiallyAttached ? [() => handle.openWithPayload(8), () => handle.open('trigger'), () => handle.close()]
        : [() => handle.open('trigger'), () => handle.openWithPayload(8), () => handle.close()];
      await expectDiagnostic({ message: /Base UI: DialogHandle\.(open\(\)|close\(\)|openWithPayload\(\)).*no root/, count: 3 }, () => { for (const call of calls) call(); });
      expect(untrack(() => handle.isOpen)).toBe(false);
      await view.setProps({ mounted: true });
      expect(view.queryByRole('dialog')).toBeNull();
      expect(view.getByTestId('payload').textContent).toBe('No payload');
      await view.user.click(view.getByText('Trigger'));
      expect(await view.findByRole('dialog')).toBeVisible();
      expect(view.getByTestId('payload').textContent).toBe('1');
    });
  }
  it('source live handle A to B to A swaps retain control and trigger ARIA', async () => {
    const first = Dialog.createHandle();
    const second = Dialog.createHandle();
    const view = await renderProps((props: { handle: Dialog.Handle }) => <>
      <Dialog.Trigger handle={props.handle} id="trigger">Trigger</Dialog.Trigger>
      <Dialog.Root handle={props.handle} modal={false} disablePointerDismissal><Dialog.Portal><Dialog.Popup>Dialog Content</Dialog.Popup></Dialog.Portal></Dialog.Root>
    </>, { handle: first });
    const trigger = view.getByText('Trigger');
    await view.user.click(trigger);
    const popup = await view.findByRole('dialog');
    for (const [next, old] of [[second, first], [first, second]]) {
      await view.setProps({ handle: next });
      expect(view.getByRole('dialog')).toBe(popup);
      expect(popup).toBeVisible();
      expect(untrack(() => next.isOpen)).toBe(true);
      expect(untrack(() => old.isOpen)).toBe(false);
      expect(trigger).toHaveAttribute('aria-controls', popup.id);
    }
    first.close();
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
  });
  it('source handle attachment toggle diagnoses exactly the two detached opens', async () => {
    const handle = Dialog.createHandle();
    const view = await renderProps((props: { attached: boolean }) => <>
      <Dialog.Trigger handle={handle} id="trigger">Trigger</Dialog.Trigger>
      <Dialog.Root handle={props.attached ? handle : undefined} modal={false} disablePointerDismissal><Dialog.Portal><Dialog.Popup>Dialog Content</Dialog.Popup></Dialog.Portal></Dialog.Root>
    </>, { attached: false });
    await expectDiagnostic({ message: /DialogHandle\.open\(\).*no root/, count: 1 }, () => handle.open('trigger'));
    expect(untrack(() => handle.isOpen)).toBe(false);
    expect(view.queryByRole('dialog')).toBeNull();
    await view.setProps({ attached: true });
    handle.open('trigger');
    const popup = await view.findByRole('dialog');
    expect(popup).toBeVisible();
    expect(view.getByText('Trigger')).toHaveAttribute('aria-controls', popup.id);
    handle.close();
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    await view.setProps({ attached: false });
    await expectDiagnostic({ message: /DialogHandle\.open\(\).*no root/, count: 1 }, () => handle.open('trigger'));
    expect(untrack(() => handle.isOpen)).toBe(false);
    expect(view.queryByRole('dialog')).toBeNull();
  });
  for (const contained of [true, false]) {
    browserCase({ source: 'packages/react/src/dialog/root/DialogRoot.detached-triggers.test.tsx', case: `source modal three-trigger cycles (${contained ? 'contained' : 'detached'})`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const handle = Dialog.createHandle();
      const Triggers = () => <>{[1, 2, 3].map((value) => <Dialog.Trigger handle={contained ? undefined : handle}>Trigger {value}</Dialog.Trigger>)}</>;
      const view = await render(() => <>{!contained && <Triggers />}<Dialog.Root handle={contained ? undefined : handle}>
        {contained && <Triggers />}<Dialog.Portal><Dialog.Popup>Dialog Content<Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
      </Dialog.Root></>);
      expect(view.queryByText('Dialog Content')).toBeNull();
      for (const value of [1, 2, 3]) {
        await view.user.click(view.getByText(`Trigger ${value}`));
        expect(view.getByText('Dialog Content')).toBeInTheDocument();
        if (value < 3) {
          await view.user.click(view.getByText('Close'));
          await waitFor(() => expect(view.queryByText('Dialog Content')).toBeNull());
        }
      }
    });
  }
  browserCase({ source: 'packages/react/src/dialog/root/DialogRoot.detached-triggers.test.tsx', case: 'source controlled contained trigger ARIA', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <Dialog.Root open triggerId="second">
      <Dialog.Trigger id="first">Trigger 1</Dialog.Trigger><Dialog.Trigger id="second">Trigger 2</Dialog.Trigger>
      <Dialog.Portal><Dialog.Popup>Dialog Content</Dialog.Popup></Dialog.Portal>
    </Dialog.Root>);
    expect(view.getByText('Trigger 1')).toHaveAttribute('aria-expanded', 'false');
    expect(view.getByText('Trigger 1')).not.toHaveAttribute('aria-controls');
    expect(view.getByText('Trigger 2')).toHaveAttribute('aria-expanded', 'true');
    expect(view.getByText('Trigger 2')).toHaveAttribute('aria-controls', view.getByRole('dialog').id);
  });
  browserCase({ source: 'packages/react/src/dialog/root/DialogRoot.detached-triggers.test.tsx', case: 'source controlled triggerId external open restores external opener focus', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => {
      const [open, setOpen] = createSignal(false);
      const [triggerId, setTriggerId] = createSignal<string | null>(null);
      return <><Dialog.Root<number> open={open()} triggerId={triggerId()} onOpenChange={setOpen}>
        {(context) => <><Dialog.Trigger id="first" payload={1}>One</Dialog.Trigger><Dialog.Trigger id="second" payload={2}>Two</Dialog.Trigger>
          <Dialog.Portal><Dialog.Popup><span data-testid="content">{context.payload}</span><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal></>}
      </Dialog.Root><button onClick={() => { setTriggerId('second'); setOpen(true); }}>Open programmatically</button></>;
    });
    const opener = view.getByText('Open programmatically');
    await view.user.click(opener);
    expect(view.getByTestId('content').textContent).toBe('2');
    await view.user.click(view.getByText('Close'));
    await waitFor(() => expect(view.queryByTestId('content')).toBeNull());
    expect(opener).toHaveFocus();
  });
  browserCase({ source: 'packages/react/src/dialog/root/DialogRoot.detached-triggers.test.tsx', case: 'source contained numeric registration payload updates while open', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => {
      const [values, setValues] = createSignal([1, 2]);
      return <Dialog.Root<number>>{(context) => <>
        <Dialog.Trigger id="first" payload={values()[0]}>Dialog 1</Dialog.Trigger><Dialog.Trigger id="second" payload={values()[1]}>Dialog 2</Dialog.Trigger>
        <Dialog.Portal><Dialog.Popup><span data-testid="content">{context.payload}</span>
          <button onClick={() => setValues([8, 16])}>Update payloads</button>
        </Dialog.Popup></Dialog.Portal>
      </>}</Dialog.Root>;
    });
    await view.user.click(view.getByText('Dialog 1'));
    expect(view.getByTestId('content').textContent).toBe('1');
    await view.user.click(view.getByText('Update payloads'));
    expect(view.getByTestId('content').textContent).toBe('8');
  });
  for (const imperative of [false, true]) {
    browserCase({ source: 'packages/react/src/dialog/root/DialogRoot.detached-triggers.test.tsx', case: `source persistent two-trigger remount and association imperative=${imperative}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const handle = Dialog.createHandle<number>();
      const view = await render(() => {
        const [mounted, setMounted] = createSignal(true);
        return <><Dialog.Trigger handle={handle} id="first" payload={7}>Trigger 1</Dialog.Trigger><Dialog.Trigger handle={handle} id="second" payload={2}>Trigger 2</Dialog.Trigger>
          {!mounted() && <button onClick={() => setMounted(true)}>Remount root</button>}
          {mounted() && <Dialog.Root handle={handle}>{(context) => <>
            <span data-testid="payload">{context.payload ?? 'No payload'}</span><Dialog.Portal><Dialog.Popup>
              Dialog Content<button onClick={() => setMounted(false)}>Unmount root</button>
            </Dialog.Popup></Dialog.Portal>
          </>}</Dialog.Root>}
        </>;
      });
      const first = view.getByText('Trigger 1');
      const open = async () => {
        if (imperative) handle.open('first'); else await view.user.click(first);
        const popup = await view.findByRole('dialog');
        expect(popup).toBeVisible();
        expect(first).toHaveAttribute('aria-expanded', 'true');
        expect(first).toHaveAttribute('aria-controls', popup.id);
        expect(view.getByText('Trigger 2')).toHaveAttribute('aria-expanded', 'false');
        expect(view.getByTestId('payload').textContent).toBe('7');
      };
      await open();
      await view.user.click(view.getByText('Unmount root'));
      expect(view.queryByRole('dialog')).toBeNull();
      await view.user.click(view.getByText('Remount root'));
      expect(view.queryByRole('dialog')).toBeNull();
      expect(view.getByText('Trigger 1')).toBe(first);
      expect(first).toHaveAttribute('aria-expanded', 'false');
      expect(first).not.toHaveAttribute('aria-controls');
      expect(view.getByTestId('payload').textContent).toBe('No payload');
      await open();
    });
  }
  browserCase({ source: 'packages/react/src/dialog/root/DialogRoot.detached-triggers.test.tsx', case: 'source payload-only root remount clears payload8', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const handle = Dialog.createHandle<number>();
    const view = await render(() => {
      const [mounted, setMounted] = createSignal(true);
      return <>{!mounted() && <button onClick={() => setMounted(true)}>Remount root</button>}
        {mounted() && <Dialog.Root handle={handle}>{(context) => <>
          <span data-testid="payload">{context.payload ?? 'No payload'}</span><Dialog.Portal><Dialog.Popup>
            Dialog Content<button onClick={() => setMounted(false)}>Unmount root</button>
          </Dialog.Popup></Dialog.Portal>
        </>}</Dialog.Root>}
      </>;
    });
    expect(view.getByTestId('payload').textContent).toBe('No payload');
    handle.openWithPayload(8);
    expect(await view.findByRole('dialog')).toBeVisible();
    expect(view.getByTestId('payload').textContent).toBe('8');
    await view.user.click(view.getByText('Unmount root'));
    expect(view.queryByTestId('payload')).toBeNull();
    await view.user.click(view.getByText('Remount root'));
    expect(view.queryByRole('dialog')).toBeNull();
    expect(view.getByTestId('payload').textContent).toBe('No payload');
  });
  for (const triggerCount of [1, 2]) {
    it(`source programmatic payload with ${triggerCount} rendered triggers preserves association and close`, async () => {
      const handle = Dialog.createHandle<string | number>();
      const view = await render(() => <>
        <Dialog.Trigger handle={handle} id="first" payload={triggerCount === 1 ? 'from trigger' : 1}>Trigger 1</Dialog.Trigger>
        {triggerCount === 2 && <Dialog.Trigger handle={handle} id="second" payload={2}>Trigger 2</Dialog.Trigger>}
        <Dialog.Root handle={handle}>{(context) => <Dialog.Portal><Dialog.Popup>{context.payload}</Dialog.Popup></Dialog.Portal>}</Dialog.Root>
      </>);
      const first = view.getByText('Trigger 1');
      expect(view.queryByRole('dialog')).toBeNull();
      handle.openWithPayload(triggerCount === 1 ? 'from openWithPayload' : 8);
      const popup = await view.findByRole('dialog');
      expect(popup.textContent).toBe(triggerCount === 1 ? 'from openWithPayload' : '8');
      expect(first).toHaveAttribute('aria-expanded', 'false');
      expect(first).not.toHaveAttribute('aria-controls');
      expect(first).not.toHaveAttribute('data-popup-open');
      if (triggerCount === 2) expect(view.getByText('Trigger 2')).not.toHaveAttribute('aria-expanded', 'true');
      handle.close();
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      if (triggerCount === 1) {
        await view.user.click(first);
        const reopened = await view.findByRole('dialog');
        expect(reopened.textContent).toBe('from trigger');
        expect(first).toHaveAttribute('aria-expanded', 'true');
        expect(first).toHaveAttribute('aria-controls', reopened.id);
      }
    });
  }
  it('a detached trigger declared after the root registers and controls its popup', async () => {
    const handle = Dialog.createHandle();
    const view = await render(() => <><Dialog.Root handle={handle}><Dialog.Portal><Dialog.Popup>Dialog Content</Dialog.Popup></Dialog.Portal></Dialog.Root>
      <Dialog.Trigger handle={handle} id="trigger">Trigger</Dialog.Trigger></>);
    const trigger = view.getByRole('button', { name: 'Trigger' });
    await view.user.click(trigger);
    const popup = await view.findByRole('dialog');
    expect(popup).toBeVisible();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', popup.id);
  });
  it('same-commit open by ID chooses the requested trigger and its own payload', async () => {
    const handle = Dialog.createHandle<number>();
    function Open() { onSettled(() => { handle.open('requested'); }); return null; }
    const view = await render(() => <>
      <Dialog.Trigger handle={handle} id="other" payload={9}>Other</Dialog.Trigger>
      <Dialog.Trigger handle={handle} id="requested" payload={5}>Trigger</Dialog.Trigger>
      <Dialog.Root handle={handle}>{(context) => <Dialog.Portal><Dialog.Popup>{context.payload}</Dialog.Popup></Dialog.Portal>}</Dialog.Root>
      <Open />
    </>);
    const popup = await view.findByRole('dialog');
    expect(popup).toBeVisible();
    expect(popup.textContent).toBe('5');
    expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'true');
    expect(view.getByText('Trigger')).toHaveAttribute('aria-controls', popup.id);
    expect(view.getByText('Other')).not.toHaveAttribute('aria-controls');
  });
  for (const contained of [true, false]) {
    browserCase({ source: 'packages/react/src/dialog/root/DialogRoot.detached-triggers.test.tsx', case: `user switch retains payload and popup identity (${contained ? 'contained' : 'detached'})`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const handle = Dialog.createHandle<number>();
      const Triggers = () => <><Dialog.Trigger handle={contained ? undefined : handle} payload={1}>Trigger 1</Dialog.Trigger>
        <Dialog.Trigger handle={contained ? undefined : handle} payload={2}>Trigger 2</Dialog.Trigger></>;
      const view = await render(() => <>{!contained && <Triggers />}<Dialog.Root handle={contained ? undefined : handle}>
        {(context) => <>{contained && <Triggers />}<Dialog.Portal><Dialog.Popup>{context.payload}</Dialog.Popup></Dialog.Portal></>}
      </Dialog.Root></>);
      const first = view.getByText('Trigger 1');
      const second = view.getByText('Trigger 2');
      expect(first).toHaveAttribute('aria-expanded', 'false');
      expect(second).toHaveAttribute('aria-expanded', 'false');
      await view.user.click(first);
      const popup = view.getByRole('dialog');
      expect(popup.textContent).toBe('1');
      expect(first.getAttribute('aria-controls')).not.toBeNull();
      expect(first).toHaveAttribute('aria-controls', popup.id);
      expect(first).toHaveAttribute('aria-expanded', 'true');
      expect(second).toHaveAttribute('aria-expanded', 'false');
      await view.user.click(second);
      expect(view.getByRole('dialog')).toBe(popup);
      expect(popup.textContent).toBe('2');
    });
  }
  for (const direction of ['remove', 'add', 'recreate-and-remove', 'recreate'] as const) {
    browserCase({ source: 'packages/react/src/dialog/root/DialogRoot.detached-triggers.test.tsx', case: `source reparent depth and click cycles (${direction})`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      function Trigger(props: { handle: Dialog.Handle; depth: number }) {
        return <>{props.depth === 0 ? <Dialog.Trigger handle={props.handle}>Trigger</Dialog.Trigger>
          : <div><Trigger handle={props.handle} depth={props.depth - 1} /></div>}</>;
      }
      const depths = direction === 'add' ? [0, 1, 2, 3] : direction === 'recreate' ? [0, 0, 0] : [3, 2, 1, 0];
      const initialHandle = Dialog.createHandle();
      const view = await renderProps((props: { handle: Dialog.Handle; depth: number }) => <>
        <Trigger handle={props.handle} depth={props.depth} /><Dialog.Root handle={props.handle}><Dialog.Portal><Dialog.Popup>
          Dialog Content<Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup></Dialog.Portal></Dialog.Root>
      </>, { handle: initialHandle, depth: depths[0] });
      for (const [index, depth] of depths.entries()) {
        if (index !== 0) await view.setProps({ depth, ...(direction.startsWith('recreate') ? { handle: Dialog.createHandle() } : {}) });
        await view.user.click(view.getByRole('button', { name: 'Trigger' }));
        expect(view.getByRole('dialog')).toBeVisible();
        await view.user.click(view.getByText('Close'));
        await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      }
    });
  }
  it('persistent overlap is diagnosed once and restores the older owner on replacement disposal', async () => {
    vi.useFakeTimers();
    const handle = Dialog.createHandle();
    let view!: Awaited<ReturnType<typeof render>>;
    await expectDiagnostic({ message: /Base UI: A handle is attached to more than one mounted root/, count: 1 }, async () => {
      view = await render(() => <><Dialog.Root handle={handle} /><Dialog.Root handle={handle} /></>);
      await advanceFrame();
    });
    view.unmount();
    await advanceFrame();
    expect(untrack(() => handle.isOpen)).toBe(false);
  });

  it('an abandoned pending root never steals attachment from a committed root', async () => {
    const handle = Dialog.createHandle<number>();
    const attempted = vi.fn();
    let resolve!: (value: string) => void;
    const pending = new Promise<string>((done) => { resolve = done; });
    function Suspend() { attempted(); const text = createMemo(() => pending); return <span>{text()}</span>; }
    const view = await renderProps((props: { replacement: boolean }) => <>
      <Dialog.Trigger id="one" handle={handle} payload={5}>Trigger</Dialog.Trigger>
      <Dialog.Root handle={handle} modal={false} disablePointerDismissal>
        {(context) => <Dialog.Portal><Dialog.Popup data-testid="committed">{context.payload}</Dialog.Popup></Dialog.Portal>}
      </Dialog.Root>
      <Loading fallback="Loading replacement">{props.replacement && <Dialog.Root handle={handle}>
        <Suspend /><Dialog.Portal><Dialog.Popup data-testid="replacement" /></Dialog.Portal>
      </Dialog.Root>}</Loading>
    </>, { replacement: false });
    handle.open('one');
    const committed = await view.findByTestId('committed');
    expect(committed).toBeVisible();
    expect(committed.textContent).toBe('5');
    expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'true');
    await view.setProps({ replacement: true });
    expect(attempted).toHaveBeenCalled();
    expect(untrack(() => handle.isOpen)).toBe(true);
    expect(view.getByTestId('committed')).toBe(committed);
    expect(committed.textContent).toBe('5');
    expect(view.queryByTestId('replacement')).toBeNull();
    expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'true');
    await view.setProps({ replacement: false });
    expect(view.queryByTestId('replacement')).toBeNull();
    expect(view.getByTestId('committed')).toBe(committed);
    expect(committed).toBeVisible();
    expect(committed.textContent).toBe('5');
    expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'true');
    expect(untrack(() => handle.isOpen)).toBe(true);
    resolve('obsolete');
    handle.close();
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
  });

  it('a previously dirtied handle attaches to fresh root state rather than reviving its payload', async () => {
    const first = Dialog.createHandle<number>();
    const dirty = Dialog.createHandle<number>();
    const view = await renderProps((props: { dirtyRoot: boolean; handle: Dialog.Handle<number> }) => <>
      {props.dirtyRoot && <Dialog.Root handle={dirty} modal={false}>
        {(context) => <Dialog.Portal><Dialog.Popup data-testid="dirty">{context.payload}</Dialog.Popup></Dialog.Portal>}
      </Dialog.Root>}
      {!props.dirtyRoot && <><Dialog.Trigger handle={props.handle} id="fresh" payload={1}>Trigger</Dialog.Trigger><Dialog.Root handle={props.handle} modal={false}>
        {(context) => <><span data-testid="payload">{context.payload ?? 'No payload'}</span><Dialog.Portal><Dialog.Popup>Dialog Content</Dialog.Popup></Dialog.Portal></>}
      </Dialog.Root></>}
    </>, { dirtyRoot: true, handle: first });
    dirty.openWithPayload(8);
    expect((await view.findByTestId('dirty')).textContent).toBe('8');
    await view.setProps({ dirtyRoot: false });
    expect(untrack(() => dirty.isOpen)).toBe(false);
    expect(view.queryByRole('dialog')).toBeNull();
    expect(view.getByTestId('payload').textContent).toBe('No payload');
    await view.setProps({ handle: dirty });
    expect(untrack(() => dirty.isOpen)).toBe(false);
    expect(view.getByTestId('payload').textContent).toBe('No payload');
    expect(view.queryByRole('dialog')).toBeNull();
    await view.user.click(view.getByText('Trigger'));
    expect(await view.findByRole('dialog')).toBeVisible();
    expect(view.getByTestId('payload').textContent).toBe('1');
    expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'true');
  });

  it('switching root handle removes old-handle trigger lookup', async () => {
    const first = Dialog.createHandle<number>();
    const second = Dialog.createHandle<number>();
    const view = await renderProps((props: { handle: Dialog.Handle<number> }) => <>
      <Dialog.Trigger handle={first} id="a" payload={1}>A</Dialog.Trigger>
      <Dialog.Root handle={props.handle} modal={false} disablePointerDismissal><Dialog.Portal><Dialog.Popup /></Dialog.Portal></Dialog.Root>
    </>, { handle: first });
    first.open('a');
    await view.findByRole('dialog');
    expect(view.getByText('A')).toHaveAttribute('aria-expanded', 'true');
    first.close();
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    await view.setProps({ handle: second });
    await expectDiagnostic({ message: /DialogHandle\.open: No trigger found with id "a"/ }, () => second.open('a'));
    await view.findByRole('dialog');
    expect(view.getByText('A')).toHaveAttribute('aria-expanded', 'false');
  });

  for (const fromControlled of [true, false]) {
    it(`remount across controlled ownership fromControlled=${fromControlled} starts fresh`, async () => {
      const handle = Dialog.createHandle();
      const view = await renderProps((props: { phase: number }) => <>
        <Dialog.Trigger handle={handle} id="one">Trigger</Dialog.Trigger>
        {props.phase === 0 && <Dialog.Root handle={handle} open={fromControlled ? true : undefined} modal={false}>
          <Dialog.Portal><Dialog.Popup /></Dialog.Portal>
        </Dialog.Root>}
        {props.phase === 2 && <Dialog.Root handle={handle} open={fromControlled ? undefined : true} modal={false}>
          <Dialog.Portal><Dialog.Popup /></Dialog.Portal>
        </Dialog.Root>}
      </>, { phase: 0 });
      await view.setProps({ phase: 1 });
      expect(view.queryByRole('dialog')).toBeNull();
      await view.setProps({ phase: 2 });
      expect(untrack(() => handle.isOpen)).toBe(!fromControlled);
      expect(Boolean(view.queryByRole('dialog'))).toBe(!fromControlled);
    });
  }

  it.skipIf(!isJSDOM)('production detached payload calls are silent and leave the stable fallback closed', () => {
    const previous = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      const handle = Dialog.createHandle<number>();
      handle.openWithPayload(8);
      expect(untrack(() => handle.isOpen)).toBe(false);
    } finally { process.env.NODE_ENV = previous; }
  });

  for (const operation of ['open', 'close', 'openWithPayload'] as const) {
    it(`${operation} from a committed descendant on initial mount`, async () => {
      const handle = Dialog.createHandle<number>();
      function Act() {
        onSettled(() => { if (operation === 'open') handle.open(null); else if (operation === 'close') handle.close(); else handle.openWithPayload(8); });
        return null;
      }
      const view = await render(() => <Dialog.Root handle={handle} defaultOpen={operation === 'close'} modal={false}>
        {(context) => <><Act /><span data-testid="payload">{context.payload ?? 'No payload'}</span>
          <Dialog.Portal><Dialog.Popup /></Dialog.Portal></>}
      </Dialog.Root>);
      expect(untrack(() => handle.isOpen)).toBe(operation !== 'close');
      expect(view.getByTestId('payload').textContent).toBe(operation === 'openWithPayload' ? '8' : 'No payload');
    });
  }

  it('payload readers suspend within the host Loading slot and resume with current payload', async () => {
    const handle = Dialog.createHandle<Promise<string>>();
    let resolve!: (value: string) => void;
    const pending = new Promise<string>((done) => { resolve = done; });
    const view = await render(() => <>
      <Dialog.Trigger handle={handle} payload={pending}>Pending</Dialog.Trigger>
      <Dialog.Root handle={handle} modal={false}>
        {(context) => {
          const value = createMemo(async () => await context.payload);
          return <Dialog.Portal><Dialog.Popup><Loading fallback="Loading payload"><span>{value()}</span></Loading></Dialog.Popup></Dialog.Portal>;
        }}
      </Dialog.Root>
    </>);
    await view.user.click(view.getByText('Pending'));
    expect(await view.findByText('Loading payload')).toBeInTheDocument();
    resolve('resolved');
    expect(await view.findByText('resolved')).toBeInTheDocument();
    handle.close();
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
  });

  it('function payload stays raw and reactive without root setup restarting', async () => {
    const handle = Dialog.createHandle<() => number>();
    let setValue!: (value: number) => void;
    let setups = 0;
    const view = await render(() => {
      const [value, set] = createSignal(1);
      setValue = set;
      return <><Dialog.Trigger id="one" handle={handle} payload={value}>One</Dialog.Trigger>
        <Dialog.Root handle={handle} modal={false} disablePointerDismissal>
          {(context) => { setups++; return <Dialog.Portal><Dialog.Popup>{context.payload?.()}</Dialog.Popup></Dialog.Portal>; }}
        </Dialog.Root></>;
    });
    await view.user.click(view.getByText('One'));
    const popup = view.getByRole('dialog');
    expect(popup.textContent).toBe('1');
    setValue(8); flush();
    expect(popup.textContent).toBe('8');
    expect(view.getByRole('dialog')).toBe(popup);
    expect(setups).toBe(1);
  });

  for (const contained of [false, true]) {
    it(`all three ${contained ? 'contained' : 'detached'} triggers open, switch and reopen`, async () => {
      const handle = Dialog.createHandle<number>();
      const Triggers = () => <>{[1, 2, 3].map((value) => <Dialog.Trigger id={`trigger-${value}`} handle={contained ? undefined : handle} payload={value}>Trigger {value}</Dialog.Trigger>)}</>;
      const view = await render(() => <>
        {!contained && <Triggers />}
        <Dialog.Root handle={contained ? undefined : handle} modal={false} disablePointerDismissal>
          {(context) => <>{contained && <Triggers />}<Dialog.Portal><Dialog.Popup>
            <output>{context.payload as number | undefined}</output><Dialog.Close>Close</Dialog.Close>
          </Dialog.Popup></Dialog.Portal></>}
        </Dialog.Root>
      </>);
      expect(view.queryByRole('dialog')).toBeNull();
      for (const value of [1, 2, 3]) {
        await view.user.click(view.getByText(`Trigger ${value}`));
        expect(view.getByRole('status').textContent).toBe(String(value));
        await view.user.click(view.getByText('Close'));
        await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      }
    });
  }

  it('fresh handles and trigger owner replacement maintain ARIA and popup DOM reuse', async () => {
    const view = await renderProps((props: { handle: Dialog.Handle<number>; wrapper: boolean }) => <>
      {props.wrapper ? <section><Dialog.Trigger handle={props.handle} id="one" payload={1}>Trigger</Dialog.Trigger></section>
        : <Dialog.Trigger handle={props.handle} id="one" payload={1}>Trigger</Dialog.Trigger>}
      <Dialog.Root open triggerId="one" handle={props.handle} modal={false} disablePointerDismissal>
        <Dialog.Portal><Dialog.Popup /></Dialog.Portal>
      </Dialog.Root>
    </>, { handle: Dialog.createHandle<number>(), wrapper: true });
    const popup = view.getByRole('dialog');
    for (const wrapper of [false, true, false]) {
      await view.setProps({ handle: Dialog.createHandle<number>(), wrapper });
      expect(view.getByRole('dialog')).toBe(popup);
      expect(view.getByText('Trigger')).toHaveAttribute('aria-controls', popup.id);
      expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'true');
    }
  });

  it('ignores detached imperative calls with precise development diagnostics', async () => {
    const handle = Dialog.createHandle<number>();
    for (const call of [() => handle.open(null), () => handle.close(), () => handle.openWithPayload(9)]) {
      await expectDiagnostic({ message: /Base UI: DialogHandle\.(open\(\)|close\(\)|openWithPayload\(\)).*no root/ }, call);
    }
    expect(untrack(() => handle.isOpen)).toBe(false);
    const view = await render(() => <Dialog.Root handle={handle} modal={false}><Dialog.Portal><Dialog.Popup /></Dialog.Portal></Dialog.Root>);
    view.unmount();
    await expectDiagnostic({ message: /DialogHandle\.open\(\).*no root/ }, () => handle.open(null));
    expect(untrack(() => handle.isOpen)).toBe(false);
  });

  it('unknown trigger ID opens unassociated with a diagnostic', async () => {
    const handle = Dialog.createHandle();
    const view = await render(() => <>
      <Dialog.Trigger handle={handle} id="actual">Trigger</Dialog.Trigger>
      <Dialog.Root handle={handle} modal={false}><Dialog.Portal><Dialog.Popup /></Dialog.Portal></Dialog.Root>
    </>);
    await expectDiagnostic({ message: /DialogHandle\.open: No trigger found with id "missing"/ }, () => handle.open('missing'));
    await view.findByRole('dialog');
    expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'false');
  });

  for (const remove of ['older', 'newer'] as const) {
    it(`overlapping roots restore the correct owner when ${remove} detaches`, async () => {
      vi.useFakeTimers();
      const handle = Dialog.createHandle<number>();
      const view = await renderProps((props: { first: boolean; second: boolean }) => <>
        {props.first && <Dialog.Root handle={handle} modal={false}>
          {(context) => <Dialog.Portal><Dialog.Popup data-testid="first">{context.payload}</Dialog.Popup></Dialog.Portal>}
        </Dialog.Root>}
        {props.second && <Dialog.Root handle={handle} modal={false}>
          {(context) => <Dialog.Portal><Dialog.Popup data-testid="second">{context.payload}</Dialog.Popup></Dialog.Portal>}
        </Dialog.Root>}
      </>, { first: true, second: false });
      // Resolve transient overlap within the warning frame; a permanent overlap is diagnosed separately.
      await view.setProps({ second: true });
      await view.setProps(remove === 'older' ? { first: false } : { second: false });
      await advanceFrame();
      handle.openWithPayload(17);
      const target = await view.findByTestId(remove === 'older' ? 'second' : 'first');
      expect(target.textContent).toBe('17');
      expect(target).toBeVisible();
      expect(view.queryByTestId(remove === 'older' ? 'first' : 'second')).toBeNull();
      expect(untrack(() => handle.isOpen)).toBe(true);
      handle.close();
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    });
  }
  it('a trigger from the outgoing root resolves in the same committed overlap and survives handoff', async () => {
    // Only the transient-overlap warning's frame is controlled. jsdom's native
    // focus schedules selectionchange with setTimeout(0); it is not an owned
    // component timer and must retain its native clock.
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    const handle = Dialog.createHandle();
    function Open() { onSettled(() => { handle.open('trigger'); }); return null; }
    const view = await renderProps((props: { phase: 'outgoing' | 'overlap' | 'incoming' }) => <>
      <Dialog.Trigger handle={handle} id="trigger">Trigger</Dialog.Trigger>
      {props.phase !== 'incoming' && <Dialog.Root handle={handle} modal={false}><Dialog.Portal><Dialog.Popup>Outgoing</Dialog.Popup></Dialog.Portal></Dialog.Root>}
      {props.phase !== 'outgoing' && <><Dialog.Root handle={handle} modal={false}><Dialog.Portal><Dialog.Popup>Incoming</Dialog.Popup></Dialog.Portal></Dialog.Root><Open /></>}
    </>, { phase: 'outgoing' });
    await view.setProps({ phase: 'overlap' });
    expect(untrack(() => handle.isOpen)).toBe(true);
    expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'true');
    await view.setProps({ phase: 'incoming' });
    expect(untrack(() => handle.isOpen)).toBe(true);
    await advanceFrame();
    view.unmount();
  });
  for (const payload of [undefined, 2]) {
    it(`source imperative association from closed state with payload=${payload}`, async () => {
      const handle = Dialog.createHandle<number>();
      const view = await render(() => <>
        {payload !== undefined && <Dialog.Trigger handle={handle} id="first" payload={1}>Trigger 1</Dialog.Trigger>}
        <Dialog.Trigger handle={handle} id="trigger" payload={payload}>Trigger</Dialog.Trigger>
        <Dialog.Root handle={handle}>{(context) => <Dialog.Portal><Dialog.Popup>{payload === undefined ? 'Content' : context.payload}</Dialog.Popup></Dialog.Portal>}</Dialog.Root>
      </>);
      const trigger = view.getByText('Trigger');
      expect(view.queryByRole('dialog')).toBeNull();
      handle.open('trigger');
      const popup = await view.findByRole('dialog');
      expect(popup.textContent).toBe(payload === undefined ? 'Content' : '2');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      if (payload !== undefined) expect(view.getByText('Trigger 1')).not.toHaveAttribute('aria-expanded', 'true');
      handle.close();
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  }

  it('opens by id, forwards live payload, reuses popup DOM, and keeps inactive ARIA clear', async () => {
    const handle = Dialog.createHandle<number>();
    const view = await renderProps((props: { value: number; popupId: string }) => <>
      <Dialog.Trigger handle={handle} id="one" payload={1}>One</Dialog.Trigger>
      <Dialog.Trigger handle={handle} id="two" payload={props.value}>Two</Dialog.Trigger>
      <Dialog.Root handle={handle} modal={false} disablePointerDismissal>
        {(context) => <Dialog.Portal><Dialog.Popup id={props.popupId}><span>{context.payload}</span></Dialog.Popup></Dialog.Portal>}
      </Dialog.Root>
    </>, { value: 2, popupId: 'popup-one' });
    expect(view.queryByRole('dialog')).toBeNull();
    handle.open('one');
    const popup = await view.findByRole('dialog');
    expect(popup.textContent).toBe('1');
    handle.open('two');
    await waitFor(() => expect(popup.textContent).toBe('2'));
    expect(view.getByRole('dialog')).toBe(popup);
    expect(view.getByText('One')).toHaveAttribute('aria-expanded', 'false');
    expect(view.getByText('One')).not.toHaveAttribute('aria-controls');
    expect(view.getByText('Two')).toHaveAttribute('aria-controls', popup.id);
    expect(view.getByText('Two')).toHaveAttribute('aria-expanded', 'true');
    await view.setProps({ value: 3, popupId: 'popup-two' });
    expect(popup.textContent).toBe('3');
    expect(view.getByText('Two')).toHaveAttribute('aria-controls', 'popup-two');
    handle.close();
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    expect(untrack(() => handle.isOpen)).toBe(false);
    expect(view.getByText('One')).toHaveAttribute('aria-expanded', 'false');
    expect(view.getByText('Two')).toHaveAttribute('aria-expanded', 'false');
  });

  it('programmatic payload is not stolen by an only or newly mounted trigger, including a controlled close veto', async () => {
    const handle = Dialog.createHandle<string>();
    const view = await renderProps((props: { trigger: boolean }) => {
      const [open, setOpen] = createSignal(false);
      return <>
        {props.trigger && <Dialog.Trigger handle={handle} id="one" payload="trigger">Trigger</Dialog.Trigger>}
        <Dialog.Root handle={handle} open={open()} modal={false} onOpenChange={(next) => { if (next) setOpen(true); }}>
          {(context) => <Dialog.Portal><Dialog.Popup>{context.payload}</Dialog.Popup></Dialog.Portal>}
        </Dialog.Root>
      </>;
    }, { trigger: false });
    handle.openWithPayload('programmatic');
    await view.findByRole('dialog');
    handle.close();
    await view.setProps({ trigger: true });
    expect(untrack(() => handle.isOpen)).toBe(true);
    expect(view.getByRole('dialog').textContent).toBe('programmatic');
    expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'false');
    expect(view.getByText('Trigger')).not.toHaveAttribute('aria-controls');
  });

  it('canceled trigger changes preserve payload, active trigger and DOM identity', async () => {
    const handle = Dialog.createHandle<string>();
    let cancel = false;
    const view = await render(() => <>
      <Dialog.Trigger handle={handle} id="one" payload="first">One</Dialog.Trigger>
      <Dialog.Trigger handle={handle} id="two" payload="second">Two</Dialog.Trigger>
      <Dialog.Root handle={handle} modal={false} onOpenChange={(_, details) => { if (cancel) details.cancel(); }}>
        {(context) => <Dialog.Portal><Dialog.Popup>{context.payload}</Dialog.Popup></Dialog.Portal>}
      </Dialog.Root>
    </>);
    handle.open('one');
    const popup = await view.findByRole('dialog');
    cancel = true;
    await view.user.click(view.getByText('Two'));
    expect(view.getByRole('dialog')).toBe(popup);
    expect(popup.textContent).toBe('first');
    expect(view.getByText('One')).toHaveAttribute('aria-expanded', 'true');
    expect(view.getByText('Two')).toHaveAttribute('aria-expanded', 'false');
  });

  it('handle swaps retain root state and release the old handle', async () => {
    const first = Dialog.createHandle<number>();
    const second = Dialog.createHandle<number>();
    const view = await renderProps((props: { handle: Dialog.Handle<number> | undefined }) => <Dialog.Root handle={props.handle} modal={false}>
      {(context) => <Dialog.Portal><Dialog.Popup>{context.payload}</Dialog.Popup></Dialog.Portal>}
    </Dialog.Root>, { handle: first as Dialog.Handle<number> | undefined });
    first.openWithPayload(7);
    const popup = await view.findByRole('dialog');
    await view.setProps({ handle: second });
    expect(untrack(() => first.isOpen)).toBe(false);
    expect(untrack(() => second.isOpen)).toBe(true);
    expect(view.getByRole('dialog')).toBe(popup);
    expect(popup.textContent).toBe('7');
    await view.setProps({ handle: undefined });
    expect(untrack(() => second.isOpen)).toBe(false);
    expect(view.getByRole('dialog')).toBe(popup);
    await view.setProps({ handle: second });
    second.close();
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
  });

  it('root remount gets fresh state while persistent detached triggers migrate', async () => {
    const handle = Dialog.createHandle<number>();
    const view = await renderProps((props: { mounted: boolean }) => <>
      <Dialog.Trigger handle={handle} id="persistent" payload={7}>Trigger</Dialog.Trigger>
      {props.mounted && <Dialog.Root handle={handle} modal={false}>
        {(context) => <Dialog.Portal><Dialog.Popup>{context.payload}</Dialog.Popup></Dialog.Portal>}
      </Dialog.Root>}
    </>, { mounted: true });
    handle.open('persistent');
    const oldPopup = await view.findByRole('dialog');
    await view.setProps({ mounted: false });
    expect(untrack(() => handle.isOpen)).toBe(false);
    await view.setProps({ mounted: true });
    expect(view.queryByRole('dialog')).toBeNull();
    expect(view.getByText('Trigger')).toHaveAttribute('aria-expanded', 'false');
    handle.open('persistent');
    const popup = await view.findByRole('dialog');
    expect(popup).not.toBe(oldPopup);
    expect(popup.textContent).toBe('7');
  });

  it('reparented trigger owners still control the live root', async () => {
    const handle = Dialog.createHandle();
    const view = await renderProps((props: { wrapper: boolean }) => <>
      {props.wrapper ? <section><Dialog.Trigger handle={handle}>Trigger</Dialog.Trigger></section> : <Dialog.Trigger handle={handle}>Trigger</Dialog.Trigger>}
      <Dialog.Root handle={handle} modal={false} disablePointerDismissal><Dialog.Portal><Dialog.Popup /></Dialog.Portal></Dialog.Root>
    </>, { wrapper: true });
    for (const wrapper of [false, true, false]) {
      await view.setProps({ wrapper });
      await view.user.click(view.getByText('Trigger'));
      await view.findByRole('dialog');
      handle.close();
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    }
  });

  it('supports imperative opening from a committed descendant', async () => {
    const handle = Dialog.createHandle<number>();
    function Open() { onSettled(() => { handle.openWithPayload(42); }); return null; }
    const view = await render(() => <Dialog.Root handle={handle} modal={false}>
      {(context) => <><Open /><Dialog.Portal><Dialog.Popup>{context.payload}</Dialog.Popup></Dialog.Portal></>}
    </Dialog.Root>);
    expect((await view.findByRole('dialog')).textContent).toBe('42');
  });

  for (const controlled of [false, true]) {
    it(`controlled/default trigger IDs select payload (${controlled})`, async () => {
      const handle = Dialog.createHandle<number>();
      const view = await render(() => <>
        <Dialog.Trigger handle={handle} id="first" payload={1}>First</Dialog.Trigger>
        <Dialog.Trigger handle={handle} id="second" payload={2}>Second</Dialog.Trigger>
        <Dialog.Root handle={handle} open={controlled ? true : undefined} defaultOpen triggerId={controlled ? 'second' : undefined} defaultTriggerId="second" modal={false}>
          {(context) => <Dialog.Portal><Dialog.Popup>{context.payload}</Dialog.Popup></Dialog.Portal>}
        </Dialog.Root>
      </>);
      expect(view.getByRole('dialog').textContent).toBe('2');
      expect(view.getByText('Second')).toHaveAttribute('aria-expanded', 'true');
      expect(view.getByText('First')).toHaveAttribute('aria-expanded', 'false');
      expect(view.getByText('First')).not.toHaveAttribute('aria-controls');
      expect(view.getByText('Second')).toHaveAttribute('aria-controls', view.getByRole('dialog').id);
    });
  }

  it('inactive detached trigger can Escape-close a nonmodal dialog', async () => {
    const handle = Dialog.createHandle();
    const view = await render(() => <>
      <Dialog.Trigger id="one" handle={handle}>One</Dialog.Trigger><Dialog.Trigger id="two" handle={handle}>Two</Dialog.Trigger>
      <Dialog.Root handle={handle} modal={false} disablePointerDismissal><Dialog.Portal><Dialog.Popup /></Dialog.Portal></Dialog.Root>
    </>);
    handle.open('one');
    await view.findByRole('dialog');
    view.getByText('Two').focus();
    await view.user.keyboard('[Escape]');
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
  });
});
