import { describe, expect, it } from 'vitest';
import { createRenderer } from '../../../test';
import { describeConformance, type ConformantComponentProps } from '../../../test/describeConformance';
import { DialogRootContext } from '../../dialog/root/DialogRootContext';
import type { DialogStore } from '../../dialog/store/DialogStore';
import { DrawerContent, type DrawerContentState, type DrawerContentProps } from './DrawerContent';

// Content only requires context presence; it must never read or create Dialog machinery.
const fixture = new Proxy({} as DialogStore, { get(_, key) { throw new Error(`Drawer.Content unexpectedly read Dialog.${String(key)}`); } });
describe('Drawer.Content', () => {
  const { render } = createRenderer();
  describeConformance<DrawerContentState, ConformantComponentProps<DrawerContentState>>(
    props => <DialogRootContext value={fixture}><DrawerContent {...props} render={props.render as DrawerContentProps['render']} /></DialogRootContext>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  );
  it('marks the pointer-excluded content subtree', async () => {
    const view = await render(() => <DialogRootContext value={fixture}><DrawerContent data-testid="content">Content</DrawerContent></DialogRootContext>);
    expect(view.getByTestId('content')).toHaveAttribute('data-drawer-content', '');
    expect(view.getByTestId('content')).not.toHaveAttribute('data-swipe-ignore');
    expect(view.getByTestId('content')).not.toHaveAttribute('data-base-ui-swipe-ignore');
  });
});
