import { describe, expect, it } from 'vitest';
import { createRenderer, screen, waitFor } from '../../../test';
import { DirectionProvider } from '../../direction-provider';
import { Popover } from '../index';
import type { Side } from '../../internals/createAnchorPositioning';

const { render, renderProps } = createRenderer();
describe('Popover Viewport source DOM', () => {
  for (const direction of ['ltr', 'rtl'] as const) {
    it.each<Side>(['top', 'bottom', 'left', 'right', 'inline-start', 'inline-end'])('anchors side=%s in ' + direction, async (side) => {
      await render(() => <DirectionProvider direction={direction}><Popover.Root open>
        <Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner side={side} collisionAvoidance={{ side: 'none', align: 'none' }}>
          <Popover.Popup data-testid="popup"><Popover.Viewport><span data-testid="content">Content</span></Popover.Viewport></Popover.Popup>
        </Popover.Positioner></Popover.Portal>
      </Popover.Root></DirectionProvider>);
      const popup = screen.getByTestId('popup');
      const left = side === 'left' || side === (direction === 'rtl' ? 'inline-end' : 'inline-start');
      const top = side === 'top';
      await waitFor(() => expect(popup.style.position).toBe(left || top ? 'absolute' : ''));
      expect(popup.style.top).toBe(left ? '0px' : '');
      expect(popup.style.right).toBe(left ? '0px' : '');
      expect(popup.style.bottom).toBe(top ? '0px' : '');
      expect(popup.style.left).toBe(top ? '0px' : '');
      expect(screen.getByTestId('content').closest('[data-current]')).toHaveTextContent('Content');
    });
  }

  it('remounts the current container on trigger change while preserving popup and positioner hosts', async () => {
    const view = await render(() => <Popover.Root<string>>{(state) => <>
      <Popover.Trigger payload="first">One</Popover.Trigger><Popover.Trigger payload="second">Two</Popover.Trigger>
      <Popover.Portal><Popover.Positioner data-testid="positioner"><Popover.Popup data-testid="popup">
        <Popover.Viewport><img alt={state.payload} src="about:blank" /></Popover.Viewport>
      </Popover.Popup></Popover.Positioner></Popover.Portal>
    </>}</Popover.Root>);
    await view.user.click(screen.getByRole('button', { name: 'One' }));
    const first = screen.getByRole('img', { name: 'first' }).closest('[data-current]');
    expect(first).not.toBeNull();
    const popup = screen.getByTestId('popup'), positioner = screen.getByTestId('positioner');
    await view.user.click(screen.getByRole('button', { name: 'Two' }));
    const second = screen.getByRole('img', { name: 'second' }).closest('[data-current]');
    expect(second).not.toBeNull();
    expect(second).not.toBe(first);
    expect(screen.getByTestId('popup')).toBe(popup);
    expect(screen.getByTestId('positioner')).toBe(positioner);
  });

  it('does not restart content transitions when a trigger remounts while closed and retained', async () => {
    const view = await renderProps((props: { show: boolean }) => <Popover.Root defaultOpen defaultTriggerId="trigger"
      onOpenChange={(_open, details) => details.preventUnmountOnClose()}>
      {props.show && <Popover.Trigger id="trigger">Toggle</Popover.Trigger>}
      <Popover.Portal><Popover.Positioner><Popover.Popup><Popover.Viewport data-testid="viewport">Content</Popover.Viewport></Popover.Popup></Popover.Positioner></Popover.Portal>
    </Popover.Root>, { show: true });
    await view.user.click(screen.getByRole('button', { name: 'Toggle' }));
    const viewport = screen.getByTestId('viewport');
    await view.setProps({ show: false });
    await view.setProps({ show: true });
    expect(screen.getByTestId('viewport')).toBe(viewport);
    expect(viewport).not.toHaveAttribute('data-transitioning');
  });
});
