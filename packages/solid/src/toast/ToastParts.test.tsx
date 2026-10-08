import { describe, it, expect, vi } from 'vitest';
import { createMemo, createSignal, For, flush, Loading } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderer, fireEvent, flushMicrotasks, screen, waitFor } from '../../test';
import { Toast } from './index';
import type { UseToastManagerReturnValue } from './useToastManager';

const { render, renderProps } = createRenderer();
describe('Toast parts — pinned source part and rendered manager assertions', () => {
  for (const part of ['title', 'description'] as const) {
    it(`${part}: fallback, explicit content, zero, empty values and dynamic label registration`, async () => {
      const Part = part === 'title' ? Toast.Title : Toast.Description;
      const attribute = part === 'title' ? 'aria-labelledby' : 'aria-describedby';
      const view = await renderProps<{ content: JSX.Element; id: string }>((props) => <Toast.Provider>
        <Toast.Root toast={{ id: 'a', title: 'Fallback', description: 'Fallback' }} data-testid="toast">
          <Part id={props.id} data-testid="label">{props.content}</Part>
        </Toast.Root>
      </Toast.Provider>, { content: undefined, id: 'initial' });
      const root = view.getByTestId('toast');
      expect(view.getByTestId('label')).toHaveTextContent('Fallback'); expect(root).toHaveAttribute(attribute, 'initial');
      await view.setProps({ content: 'Explicit', id: 'changed' });
      expect(view.getByTestId('toast')).toBe(root); expect(root).toHaveAttribute(attribute, 'changed');
      await view.setProps({ content: 0 }); expect(view.getByTestId('label')).toHaveTextContent('0');
      for (const content of ['', false, [null, false, '']] as JSX.Element[]) {
        await view.setProps({ content }); expect(view.queryByTestId('label')).toBeNull(); expect(root).not.toHaveAttribute(attribute);
      }
      await view.setProps({ content: 'Restored' }); expect(root).toHaveAttribute(attribute, 'changed');
    });
    it(`${part}: custom render content counts and styling-only childless render stays absent`, async () => {
      const Part = part === 'title' ? Toast.Title : Toast.Description;
      const view = await renderProps((props: { text: string }) => <Toast.Provider>
        <Toast.Root toast={{ id: 'a' }} data-testid="toast">
          <Part render={(host) => <div {...host as JSX.HTMLAttributes<HTMLDivElement>}>{props.text}</div>} data-testid="label" />
        </Toast.Root>
      </Toast.Provider>, { text: 'Custom' });
      await waitFor(() => expect(view.getByTestId('label')).toHaveTextContent('Custom'));
      const attribute = part === 'title' ? 'aria-labelledby' : 'aria-describedby';
      expect(view.getByTestId('toast')).toHaveAttribute(attribute, view.getByTestId('label').id);
      await view.setProps({ text: '' }); await waitFor(() => expect(view.queryByTestId('label')).toBeNull());
      await view.setProps({ text: 'Again' }); await waitFor(() => expect(view.getByTestId('label')).toHaveTextContent('Again'));
    });
    it(`${part}: callback forwards fallback content and can return no element`, async () => {
      const Part = part === 'title' ? Toast.Title : Toast.Description;
      const view = await render(() => <Toast.Provider><Toast.Root toast={{ id: 'a', title: 'Title', description: 'Description' }} data-testid="toast">
        <Part render={(host) => <div {...host as JSX.HTMLAttributes<HTMLDivElement>} />} data-testid="label" />
        <Part render={() => null} data-testid="absent" />
      </Toast.Root></Toast.Provider>);
      await waitFor(() => expect(view.getByTestId('label')).toHaveTextContent(part === 'title' ? 'Title' : 'Description'));
      expect(view.queryByTestId('absent')).toBeNull();
    });
  }
  it('async label content is held by the native host Loading boundary', async () => {
    let resolve!: (value: string) => void; let request!: (value: boolean) => void;
    const promise = new Promise<string>((done) => { resolve = done; });
    function App() {
      const [pending, setPending] = createSignal(false); request = setPending;
      const content = createMemo<string>(() => pending() ? promise : 'Before');
      return <Loading fallback="Loading"><Toast.Provider><Toast.Root toast={{ id: 'a' }} data-testid="toast"><Toast.Title>{content()}</Toast.Title></Toast.Root></Toast.Provider></Loading>;
    }
    const view = await render(() => <App />); const root = view.getByTestId('toast');
    request(true); flush(); await flushMicrotasks(); expect(root).toHaveAccessibleName('Before');
    resolve('After'); await flushMicrotasks();
    await waitFor(() => expect(root).toHaveAccessibleName('After')); expect(view.getByTestId('toast')).toBe(root);
  });
  it('does not let an older title cleanup clear a newer title', async () => {
    const view = await renderProps((props: { older: boolean }) => <Toast.Provider><Toast.Root toast={{ id: 'a' }} data-testid="toast">
      {props.older && <Toast.Title id="old">Older</Toast.Title>}<Toast.Title id="new">Newer</Toast.Title>
    </Toast.Root></Toast.Provider>, { older: true });
    expect(view.getByTestId('toast')).toHaveAttribute('aria-labelledby', 'new');
    await view.setProps({ older: false }); expect(view.getByTestId('toast')).toHaveAttribute('aria-labelledby', 'new');
  });
  it('Action uses toast action children and current callbacks; Close honors Base UI cancellation', async () => {
    const first = vi.fn(), second = vi.fn(); let manager!: UseToastManagerReturnValue;
    function Parts(props: { callback: () => void; prevent: boolean }) {
      manager = Toast.useToastManager();
      return <><button onClick={() => manager.add({ id: 'a', title: 'Saved', actionProps: { children: 'Undo' } })}>Add</button>
        <For each={manager.toasts} keyed={(toast) => toast.id}>{(toast) => <Toast.Root toast={toast()}>
          <Toast.Action onClick={() => props.callback()}>Fallback</Toast.Action>
          <Toast.Close onClick={(event) => { if (props.prevent) event.preventBaseUIHandler(); }}>Close</Toast.Close>
        </Toast.Root>}</For></>;
    }
    const view = await renderProps((props: { callback: () => void; prevent: boolean }) => <Toast.Provider timeout={0}><Parts {...props} /></Toast.Provider>, { callback: first, prevent: true });
    await view.user.click(view.getByText('Add'));
    const action = view.getByText('Undo'); await view.user.click(action); expect(first).toHaveBeenCalledTimes(1);
    await view.setProps({ callback: second }); expect(view.getByText('Undo')).toBe(action);
    await view.user.click(action); expect(second).toHaveBeenCalledTimes(1);
    await view.user.click(view.getByText('Close')); expect(view.getByRole('dialog')).toBeInTheDocument();
    await view.setProps({ prevent: false }); await view.user.click(view.getByText('Close'));
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
  });
  it('renders polite region and high priority alerts, with focus-controlled alertdialog visibility', async () => {
    const external = Toast.createToastManager();
    function List() { const manager = Toast.useToastManager(); return <For each={manager.toasts} keyed={(toast) => toast.id}>{(toast) => <Toast.Root toast={toast()} data-testid={toast().id}><Toast.Title /><Toast.Description /></Toast.Root>}</For>; }
    const view = await render(() => <Toast.Provider timeout={0} toastManager={external}><Toast.Viewport><List /></Toast.Viewport></Toast.Provider>);
    external.add({ id: 'low', title: 'Low' }); external.add({ id: 'high', title: 'Urgent', description: 'Details', priority: 'high' }); flush();
    expect(view.getByRole('region')).toHaveAttribute('aria-live', 'polite');
    expect(view.getByRole('alert')).toHaveAttribute('aria-atomic', 'true');
    expect(view.getByTestId('high')).toHaveAttribute('aria-hidden', 'true');
    const viewport = view.getByRole('region');
    const observer = new MutationObserver(() => {});
    observer.observe(viewport.parentNode!, { childList: true });
    fireEvent.keyDown(window, { key: 'F6' }); flush();
    const moved = observer.takeRecords().some((record) => [...record.removedNodes].includes(viewport));
    observer.disconnect();
    expect(moved).toBe(false);
    expect(view.getByRole('region') === viewport).toBe(true);
    expect(viewport.isConnected).toBe(true);
    expect(view.getByRole('region')).toHaveFocus(); expect(view.queryByRole('alert')).toBeNull();
    expect(view.getByRole('alertdialog')).not.toHaveAttribute('aria-hidden');
  });
  it('uses active indexes for behind/limited metadata and updates limits live', async () => {
    const external = Toast.createToastManager();
    function List() { const manager = Toast.useToastManager(); return <For each={manager.toasts} keyed={(toast) => toast.id}>{(toast) => <Toast.Root toast={toast()} data-testid={toast().id}><Toast.Content data-testid={`content-${toast().id}`}><Toast.Title /></Toast.Content></Toast.Root>}</For>; }
    const view = await renderProps((props: { limit: number }) => <Toast.Provider limit={props.limit} timeout={0} toastManager={external}><Toast.Viewport><List /></Toast.Viewport></Toast.Provider>, { limit: 1 });
    external.add({ id: 'old', title: 'Old' }); external.add({ id: 'new', title: 'New' }); flush();
    expect(view.getByTestId('old')).toHaveAttribute('data-limited'); expect(view.getByTestId('old')).toHaveAttribute('inert');
    expect(view.getByTestId('content-old')).toHaveAttribute('data-behind');
    expect(view.getByTestId('new').style.getPropertyValue('--toast-index')).toBe('0');
    await view.setProps({ limit: 2 }); expect(view.getByTestId('old')).not.toHaveAttribute('inert');
    fireEvent.mouseEnter(view.getByRole('region')); flush();
    expect(view.getByTestId('content-old')).toHaveAttribute('data-expanded');
    expect(view.getByTestId('content-new')).toHaveAttribute('data-expanded');
  });
  it('updates urgent announcements in place and suppresses them only while focus is inside', async () => {
    const external = Toast.createToastManager();
    function List() { const manager = Toast.useToastManager(); return <For each={manager.toasts} keyed={(toast) => toast.id}>{(toast) =>
      <Toast.Root toast={toast()} data-testid={toast().id}><Toast.Title /><Toast.Description /></Toast.Root>
    }</For>; }
    const view = await render(() => <Toast.Provider timeout={0} toastManager={external}>
      <Toast.Viewport><List /></Toast.Viewport><button>Outside</button>
    </Toast.Provider>);
    external.add({ id: 'low', title: 'Polite' }); flush(); expect(view.queryByRole('alert')).toBeNull();
    external.add({ id: 'high', title: 'Urgent', description: 'Before', priority: 'high' }); flush();
    const alert = view.getByRole('alert'), root = view.getByTestId('high');
    expect(alert).toHaveTextContent('UrgentBefore'); expect(root).toHaveAttribute('aria-hidden', 'true');
    external.update('high', { description: 'After' }); flush();
    expect(view.getByRole('alert') === alert).toBe(true); expect(alert).toHaveTextContent('UrgentAfter');
    root.focus(); flush(); expect(view.queryByRole('alert')).toBeNull(); expect(root).not.toHaveAttribute('aria-hidden');
    view.getByText('Outside').focus(); flush(); expect(view.getByRole('alert')).toHaveTextContent('UrgentAfter');
    external.close('high'); flush(); expect(view.queryByRole('alert')).toBeNull(); expect(view.getByTestId('low')).toBeInTheDocument();
  });
  it('retains the root and focused action across recreated objects and updates', async () => {
    const external = Toast.createToastManager();
    function List() { const manager = Toast.useToastManager(); return <For each={manager.toasts} keyed={(toast) => toast.id}>{(toast) => <Toast.Root toast={{ ...toast() }} data-testid="toast"><Toast.Title /><Toast.Action>Action</Toast.Action></Toast.Root>}</For>; }
    const view = await render(() => <Toast.Provider timeout={0} toastManager={external}><List /></Toast.Provider>);
    external.add({ id: 'a', title: 'Before' }); flush();
    const root = view.getByTestId('toast'), action = view.getByText('Action'); action.focus();
    external.update('a', { title: 'After' }); flush();
    expect(view.getByTestId('toast')).toBe(root); expect(action).toHaveFocus(); expect(root).toHaveAccessibleName('After');
  });
  it('Escape ignores focus in portaled content', async () => {
    const external = Toast.createToastManager();
    function List() { const manager = Toast.useToastManager(); return <For each={manager.toasts} keyed={(toast) => toast.id}>{(toast) => <Toast.Root toast={toast()}><Toast.Portal><button>Portaled</button></Toast.Portal></Toast.Root>}</For>; }
    const view = await render(() => <Toast.Provider timeout={0} toastManager={external}><List /></Toast.Provider>);
    external.add({ id: 'a' }); flush();
    await view.user.click(await screen.findByText('Portaled')); await view.user.keyboard('{Escape}');
    expect(view.getByRole('dialog')).toBeInTheDocument();
    view.getByRole('dialog').focus(); await view.user.keyboard('{Escape}');
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
  });
  it('Portal waits for literal null and supports ShadowRoot containers', async () => {
    const host = document.createElement('div'); document.body.append(host); const shadow = host.attachShadow({ mode: 'open' });
    try {
      const view = await renderProps<{ container: ShadowRoot | null }>((props) => <Toast.Portal container={props.container}><span>Portaled</span></Toast.Portal>, { container: null });
      expect(shadow.textContent).toBe(''); await view.setProps({ container: shadow });
      expect(shadow.textContent).toBe('Portaled'); view.unmount(); expect(shadow.textContent).toBe('');
    } finally { host.remove(); }
  });
});
