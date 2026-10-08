import { beforeEach, describe, expect, it } from 'vitest';
import { createRenderer, screen } from '../../test';
import { PreviewCard } from './index';

const { renderProps } = createRenderer();

describe('PreviewCard live part behavior', () => {
  beforeEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });

  it('keeps portaled part hosts, native semantics and state-derived classes live across controlled close/reopen', async () => {
    const view = await renderProps((props: { open: boolean; color: string }) =>
      <PreviewCard.Root open={props.open} triggerId="link">
        <PreviewCard.Trigger id="link" href="/article" class={(state) => state.open ? 'active-link' : 'inactive-link'}>Article</PreviewCard.Trigger>
        <PreviewCard.Portal keepMounted data-testid="portal">
          <PreviewCard.Backdrop data-testid="backdrop" />
          <PreviewCard.Positioner data-testid="positioner" class={(state) => state.open ? 'open-positioner' : 'closed-positioner'}>
            <PreviewCard.Popup data-testid="popup" class={(state) => state.open ? 'open-popup' : 'closed-popup'} style={{ color: props.color }}>
              <PreviewCard.Arrow data-testid="arrow" />
              <PreviewCard.Viewport data-testid="viewport">Content</PreviewCard.Viewport>
            </PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </PreviewCard.Root>, { open: true, color: 'red' });
    const portal = screen.getByTestId('portal');
    const positioner = screen.getByTestId('positioner');
    const popup = screen.getByTestId('popup');
    const arrow = screen.getByTestId('arrow');
    const backdrop = screen.getByTestId('backdrop');
    const viewport = screen.getByTestId('viewport');
    const link = screen.getByRole('link');
    expect(portal.parentElement).toBe(document.body);
    expect(positioner).toHaveAttribute('role', 'presentation');
    expect(popup).not.toHaveAttribute('role');
    expect(popup).toHaveAttribute('tabindex', '-1');
    expect(popup).toHaveAttribute('data-base-ui-focusable');
    expect(arrow).toHaveAttribute('aria-hidden', 'true');
    expect(backdrop.style.pointerEvents).toBe('none');
    expect(backdrop.style.userSelect).toBe('none');
    expect(viewport.querySelector('[data-current]')).toHaveTextContent('Content');
    expect(popup.style.color).toBe('red');
    expect(popup).toHaveClass('open-popup');
    expect(link).toHaveClass('active-link');
    await view.setProps({ open: false, color: 'blue' });
    expect(positioner).toHaveAttribute('hidden');
    expect(positioner.style.pointerEvents).toBe('none');
    expect(positioner).not.toHaveAttribute('inert');
    expect(backdrop).toHaveAttribute('hidden');
    expect(popup).toHaveAttribute('data-closed');
    expect(arrow).toHaveAttribute('data-closed');
    expect(popup).toHaveClass('closed-popup');
    expect(positioner).toHaveClass('closed-positioner');
    expect(popup.style.color).toBe('blue');
    expect(link).toHaveClass('inactive-link');
    await view.setProps({ open: true });
    expect(positioner).not.toHaveAttribute('hidden');
    expect(positioner.style.pointerEvents).toBe('');
    expect(popup).toHaveAttribute('data-open');
    for (const [id, node] of Object.entries({ portal, positioner, popup, arrow, backdrop, viewport })) {
      expect(screen.getByTestId(id)).toBe(node);
    }
  });

  it('composes native ref arrays once and reattaches replacement inputs while preserving raw link identity', async () => {
    const original: (HTMLAnchorElement | null)[] = [];
    const replacement: (HTMLAnchorElement | null)[] = [];
    const stable: (HTMLAnchorElement | null)[] = [];
    const first = (node: HTMLAnchorElement | null) => { original.push(node); };
    const second = (node: HTMLAnchorElement | null) => { replacement.push(node); };
    const common = (node: HTMLAnchorElement | null) => { stable.push(node); };
    const view = await renderProps((props: { ref: (node: HTMLAnchorElement | null) => void }) => {
      // RC13's JSX ref macro evaluates a literal ref array at creation. A live
      // getter-backed prop bag exercises actual replacement without rebuilding JSX.
      const refs = { get ref() { return [props.ref, common]; } };
      return <PreviewCard.Root><PreviewCard.Trigger href="/article" {...refs}>Article</PreviewCard.Trigger></PreviewCard.Root>;
    }, { ref: first });
    const link = screen.getByRole('link') as HTMLAnchorElement;
    expect(original).toEqual([link]);
    expect(stable).toEqual([link]);
    await view.setProps({ ref: second });
    expect(screen.getByRole('link')).toBe(link);
    expect(original).toEqual([link, null]);
    expect(replacement).toEqual([link]);
    expect(stable).toEqual([link, null, link]);
    view.unmount();
    expect(link.isConnected).toBe(false);
    expect(replacement).toEqual([link, null]);
    expect(stable).toEqual([link, null, link, null]);
  });
});
