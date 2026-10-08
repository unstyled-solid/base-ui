import { describe, it, expect, vi } from 'vitest';
import { createRenderer, describeConformance, fireEvent } from '../../test';
import type { ConformantComponentProps } from '../../test/describeConformance';
import { Dialog } from './index';
import { Errored } from 'solid-js';
import { createRenderDialogRoot } from './root/useRenderDialogRoot';

describe('Dialog small parts conformance', () => {
  describeConformance<Dialog.Trigger.State, Dialog.Trigger.Props & ConformantComponentProps<Dialog.Trigger.State>>(
    (props) => <Dialog.Root open modal={false}><Dialog.Trigger {...props} /></Dialog.Root>,
    { initialProps: {}, refInstanceof: HTMLButtonElement, button: true },
  );
  describeConformance<Dialog.Close.State, Dialog.Close.Props & ConformantComponentProps<Dialog.Close.State>>(
    (props) => <Dialog.Root open modal={false}><Dialog.Portal><Dialog.Popup><Dialog.Close {...props} /></Dialog.Popup></Dialog.Portal></Dialog.Root>,
    { initialProps: {}, refInstanceof: HTMLButtonElement, button: true },
  );
  describeConformance<Dialog.Title.State, Dialog.Title.Props & ConformantComponentProps<Dialog.Title.State>>(
    (props) => <Dialog.Root open modal={false}><Dialog.Portal><Dialog.Popup><Dialog.Title {...props} /></Dialog.Popup></Dialog.Portal></Dialog.Root>,
    { initialProps: {}, refInstanceof: HTMLHeadingElement },
  );
  describeConformance<Dialog.Description.State, Dialog.Description.Props & ConformantComponentProps<Dialog.Description.State>>(
    (props) => <Dialog.Root open modal={false}><Dialog.Portal><Dialog.Popup><Dialog.Description {...props} /></Dialog.Popup></Dialog.Portal></Dialog.Root>,
    { initialProps: {}, refInstanceof: HTMLParagraphElement },
  );
  describeConformance<Dialog.Backdrop.State, Dialog.Backdrop.Props & ConformantComponentProps<Dialog.Backdrop.State>>(
    (props) => <Dialog.Root open modal={false}><Dialog.Backdrop {...props} /></Dialog.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  );
  describeConformance<Dialog.Popup.State, Dialog.Popup.Props & ConformantComponentProps<Dialog.Popup.State>>(
    (props) => <Dialog.Root open modal={false}><Dialog.Portal><Dialog.Popup {...props} /></Dialog.Portal></Dialog.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  );
  describeConformance<Dialog.Viewport.State, Dialog.Viewport.Props & ConformantComponentProps<Dialog.Viewport.State>>(
    (props) => <Dialog.Root open modal={false}><Dialog.Portal><Dialog.Viewport {...props} /><Dialog.Popup /></Dialog.Portal></Dialog.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  );
  describeConformance<Dialog.Portal.State, Dialog.Portal.Props & ConformantComponentProps<Dialog.Portal.State>>(
    (props) => <Dialog.Root open><Dialog.Portal {...props} /></Dialog.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  );
});

describe('Dialog button and backdrop behavior', () => {
  const { render, renderProps } = createRenderer();
  for (const [part, message] of [
    ['Trigger', 'Base UI: <Dialog.Trigger> must be used within <Dialog.Root> or provided with a handle.'],
    ['Popup', 'Base UI: DialogRootContext is missing. Dialog parts must be placed within <Dialog.Root>.'],
    ['Viewport', 'Base UI: <Dialog.Portal> is missing.'],
  ] as const) {
    it(`rendering orphan ${part} exposes its exact source error through the native boundary`, async () => {
      const view = await render(() => <Errored fallback={(error) => <output data-testid="error">{String(error())}</output>}>
        {part === 'Trigger' ? <Dialog.Trigger /> : part === 'Popup' ? <Dialog.Popup /> : <Dialog.Root open><Dialog.Viewport /></Dialog.Root>}
      </Errored>);
      expect((await view.findByTestId('error')).textContent).toBe(`Error: ${message}`);
    });
  }
  for (const parentMode of ['dialog', 'alert-dialog'] as const) {
    it(`source nested style hooks with ${parentMode} parent and closed grandchild`, async () => {
      const Parent = (props: Dialog.Root.Props) => createRenderDialogRoot(parentMode, props);
      const view = await render(() => <Parent open><Dialog.Portal>
        <Dialog.Popup data-testid="parent" /><Dialog.Root open><Dialog.Portal><Dialog.Popup data-testid="child">
          <Dialog.Root><Dialog.Portal><Dialog.Popup /></Dialog.Portal></Dialog.Root>
        </Dialog.Popup></Dialog.Portal></Dialog.Root>
      </Dialog.Portal></Parent>);
      const parent = view.getByTestId('parent');
      const child = view.getByTestId('child');
      expect(parent).not.toHaveAttribute('data-nested');
      expect(child).toHaveAttribute('data-nested');
      expect(parent).toHaveAttribute('data-nested-dialog-open');
      expect(child).not.toHaveAttribute('data-nested-dialog-open');
    });
  }
  it('Viewport retains its original host across a keepMounted controlled close', async () => {
    const view = await renderProps((props: { open: boolean }) => <Dialog.Root open={props.open} modal={false}>
      <Dialog.Portal keepMounted><Dialog.Viewport data-testid="viewport"><Dialog.Popup data-testid="popup">Content</Dialog.Popup></Dialog.Viewport></Dialog.Portal>
    </Dialog.Root>, { open: true });
    const viewport = view.getByTestId('viewport');
    expect(viewport).toContainElement(view.getByTestId('popup'));
    await view.setProps({ open: false });
    expect(view.getByTestId('viewport')).toBe(viewport);
  });
  it('Viewport is absent until opening and contains its popup after opening', async () => {
    const view = await render(() => <Dialog.Root modal={false}><Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal><Dialog.Viewport data-testid="viewport"><Dialog.Popup data-testid="popup">Content</Dialog.Popup></Dialog.Viewport></Dialog.Portal>
    </Dialog.Root>);
    expect(view.queryByTestId('viewport')).toBeNull();
    await view.user.click(view.getByText('Open'));
    expect(view.getByTestId('viewport')).toContainElement(view.getByTestId('popup'));
  });
  it('explicit undefined Close onClick preserves the complete source callback sequence', async () => {
    const changed = vi.fn();
    const view = await render(() => <Dialog.Root onOpenChange={changed}><Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal><Dialog.Popup><Dialog.Close onClick={undefined}>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
    </Dialog.Root>);
    expect(changed).not.toHaveBeenCalled();
    await view.user.click(view.getByText('Open'));
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0][0]).toBe(true);
    await view.user.click(view.getByText('Close'));
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed.mock.calls[1][0]).toBe(false);
  });
  it('does not request another close for a hidden keepMounted popup', async () => {
    const change = vi.fn();
    const click = vi.fn();
    const view = await render(() => <Dialog.Root open={false} modal={false} onOpenChange={change}>
      <Dialog.Portal keepMounted><Dialog.Popup><Dialog.Close onClick={click}>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
    </Dialog.Root>);
    fireEvent.click(view.getByText('Close'));
    expect(click).toHaveBeenCalledTimes(1);
    expect(change).not.toHaveBeenCalled();
  });
  it('a disabled trigger cannot open by pointer or keyboard', async () => {
    const view = await render(() => <Dialog.Root modal={false}><Dialog.Trigger disabled>Open</Dialog.Trigger>
      <Dialog.Portal><Dialog.Popup /></Dialog.Portal>
    </Dialog.Root>);
    const trigger = view.getByText('Open');
    expect(trigger).toHaveAttribute('disabled');
    expect(trigger).toHaveAttribute('data-disabled');
    await view.user.click(trigger);
    await view.user.tab();
    expect(trigger).not.toHaveFocus();
    expect(view.queryByRole('dialog')).toBeNull();
  });
  for (const native of [true, false]) {
    it(`disabled Close preserves the opening callback sequence, nativeButton=${native}`, async () => {
      const changed = vi.fn();
      const view = await render(() => <Dialog.Root onOpenChange={changed}>
        <Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal><Dialog.Popup>
          <Dialog.Close disabled nativeButton={native} render={native ? undefined : (props) => <span {...props} />}>Close</Dialog.Close>
        </Dialog.Popup></Dialog.Portal>
      </Dialog.Root>);
      expect(changed).not.toHaveBeenCalled();
      await view.user.click(view.getByText('Open'));
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed.mock.calls[0][0]).toBe(true);
      const close = view.getByText('Close');
      expect(close).toHaveAttribute('data-disabled');
      if (native) expect(close).toHaveAttribute('disabled');
      else {
        expect(close).not.toHaveAttribute('disabled');
        expect(close).toHaveAttribute('aria-disabled', 'true');
      }
      await view.user.click(close);
      expect(changed).toHaveBeenCalledTimes(1);
    });
    it(`disabled trigger and close with nativeButton=${native}`, async () => {
      const view = await render(() => <Dialog.Root defaultOpen modal={false}>
        <Dialog.Trigger disabled nativeButton={native} render={native ? undefined : (props) => <span {...props} />}>Open</Dialog.Trigger>
        <Dialog.Portal><Dialog.Popup>
          <Dialog.Close disabled nativeButton={native} render={native ? undefined : (props) => <span {...props} />}>Close</Dialog.Close>
        </Dialog.Popup></Dialog.Portal>
      </Dialog.Root>);
      await view.user.click(view.getByText('Close'));
      expect(view.getByRole('dialog')).toBeInTheDocument();
      await view.user.click(view.getByText('Open'));
      expect(view.getByRole('dialog')).toBeInTheDocument();
    });
  }
  for (const prevent of [true, false]) {
    it(`close Base UI handler prevention=${prevent}; undefined handler still closes`, async () => {
      const changed = vi.fn();
      const view = await render(() => <Dialog.Root defaultOpen modal={false} onOpenChange={changed}>
        <Dialog.Portal><Dialog.Popup>
          <Dialog.Close onClick={prevent ? (event) => event.preventBaseUIHandler() : undefined}>Close</Dialog.Close>
        </Dialog.Popup></Dialog.Portal>
      </Dialog.Root>);
      await view.user.click(view.getByText('Close'));
      expect(Boolean(view.queryByRole('dialog'))).toBe(prevent);
      expect(changed).toHaveBeenCalledTimes(prevent ? 0 : 1);
      if (!prevent) expect(changed.mock.calls[0][0]).toBe(false);
    });
  }
  for (const forceRender of [false, true]) {
    it(`nested backdrops forceRender=${forceRender}`, async () => {
      const view = await render(() => <Dialog.Root open modal={false}>
        <Dialog.Backdrop data-testid="outer" />
        <Dialog.Root open modal={false}><Dialog.Backdrop forceRender={forceRender} data-testid="inner" /></Dialog.Root>
      </Dialog.Root>);
      expect(view.getByTestId('outer')).toHaveAttribute('role', 'presentation');
      expect(Boolean(view.queryByTestId('inner'))).toBe(forceRender);
    });
  }
  it('custom disabled Trigger neither opens nor receives tab focus', async () => {
    const view = await render(() => <Dialog.Root modal={false}>
      <Dialog.Trigger disabled nativeButton={false} render={(props) => <span {...props} />}>Open</Dialog.Trigger>
      <Dialog.Portal><Dialog.Popup><Dialog.Title>title text</Dialog.Title></Dialog.Popup></Dialog.Portal>
    </Dialog.Root>);
    const trigger = view.getByRole('button');
    expect(trigger).not.toHaveAttribute('disabled');
    expect(trigger).toHaveAttribute('data-disabled');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await view.user.click(trigger);
    expect(view.queryByText('title text')).toBeNull();
    await view.user.tab();
    expect(trigger).not.toHaveFocus();
  });
  for (const forceRender of [undefined, true]) {
    it(`three-level backdrops preserve every source nesting predicate: forceRender=${forceRender}`, async () => {
      const view = await render(() => <Dialog.Root open>
        <Dialog.Backdrop data-testid="level-1" forceRender={forceRender} />
        <Dialog.Portal><Dialog.Popup><Dialog.Root open>
          <Dialog.Backdrop data-testid="level-2" forceRender={forceRender} />
          <Dialog.Portal><Dialog.Popup><Dialog.Root open>
            <Dialog.Backdrop data-testid="level-3" forceRender={forceRender} />
            <Dialog.Portal><Dialog.Popup>Nested</Dialog.Popup></Dialog.Portal>
          </Dialog.Root></Dialog.Popup></Dialog.Portal>
        </Dialog.Root></Dialog.Popup></Dialog.Portal>
      </Dialog.Root>);
      expect(view.getByTestId('level-1')).toHaveAttribute('role', 'presentation');
      if (forceRender) {
        expect(view.getByTestId('level-2')).toBeInTheDocument();
        expect(view.getByTestId('level-3')).toBeInTheDocument();
      } else {
        expect(view.queryByTestId('level-2')).toBeNull();
        expect(view.queryByTestId('level-3')).toBeNull();
      }
    });
  }
});
