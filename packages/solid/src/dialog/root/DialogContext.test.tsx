import { describe, it, expect } from 'vitest';
import { createRenderer } from '../../../test';
import { useDialogRootContext } from './DialogRootContext';
import { useDialogPortalContext } from '../portal/DialogPortalContext';
import { FloatingNode, FloatingTree } from '../../floating-ui-react/components/FloatingTree';
import { DialogRoot } from './DialogRoot';

describe('Dialog context absence contracts', () => {
  const { render } = createRenderer();
  it('optional nesting returns null, required parts explain the missing root', async () => {
    await render(() => {
      expect(useDialogRootContext(true)).toBeNull();
      expect(() => useDialogRootContext()).toThrow(/Base UI:.*within <Dialog.Root>/);
      return <span>Checked</span>;
    });
  });
  it('portaled parts require their portal explicitly', async () => {
    await render(() => {
      expect(() => useDialogPortalContext()).toThrow('Base UI: <Dialog.Portal> is missing.');
      return <span>Checked</span>;
    });
  });

  it('keeps floating-tree nesting distinct from Dialog ancestor nesting', async () => {
    // React usePopupRootStore resolves useFloatingParentNodeId separately from
    // useRenderDialogRoot's Dialog parent/backdrop/count policy.
    function Probe(props: { id: string }) {
      const store = useDialogRootContext();
      return <output data-testid={props.id}>{String(store.state.nested)}/{String(store.state.floatingRootContext.nested)}</output>;
    }
    const view = await render(() => <>
      <FloatingTree><FloatingNode id="menu-owner"><DialogRoot>
        <Probe id="in-menu" /><DialogRoot><Probe id="dialog-in-menu" /></DialogRoot>
      </DialogRoot></FloatingNode></FloatingTree>
      <DialogRoot><Probe id="top-level" /><DialogRoot><Probe id="dialog-only" /></DialogRoot></DialogRoot>
    </>);
    expect(view.getByTestId('in-menu').textContent).toBe('false/true');
    expect(view.getByTestId('dialog-in-menu').textContent).toBe('true/true');
    expect(view.getByTestId('top-level').textContent).toBe('false/false');
    expect(view.getByTestId('dialog-only').textContent).toBe('true/false');
  });
});
