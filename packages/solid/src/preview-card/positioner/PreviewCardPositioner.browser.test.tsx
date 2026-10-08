import { afterEach, beforeEach, describe, expect } from 'vitest';
import { flush } from 'solid-js';
import { browserCase, createRenderer, fireEvent, screen, waitFor, waitSingleFrame } from '../../../test';
import { PreviewCard, PreviewCardPositionerCssVariables } from '../index';

const source = 'packages/react/src/preview-card/positioner/PreviewCardPositioner.test.tsx';
const { render, renderProps } = createRenderer();
const browser = (title: string, test: () => Promise<void>) => browserCase({ source, case: title, environment: 'browser', issue: 'bsolid-browser' }, test);
const text = 'This is a long link which will wrap over several lines to exercise the exact hovered inline reference';
const hover = (element: Element, rect: DOMRect) => {
  const coordinates = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
  fireEvent.mouseEnter(element, coordinates); fireEvent.mouseMove(element, coordinates); flush();
};
const near = (actual: number, expected: number) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(2);

interface InlineProps {
  open?: boolean;
  triggerId?: string | null;
  delay?: number;
  side?: 'top' | 'bottom';
  keepMounted?: boolean;
  onOpenChange?: PreviewCard.Root.Props['onOpenChange'];
}
function Inline(props: InlineProps) {
  // Keep the native line boxes at a stable viewport offset. A collapsing top
  // margin plus a portal can move the document's scroll anchor on focus.
  return <div style={{ width: '140px', 'padding-top': '150px', 'padding-left': '150px', 'padding-bottom': '150px' }}><PreviewCard.Root
    open={props.open} triggerId={props.triggerId} onOpenChange={props.onOpenChange}>
    <PreviewCard.Trigger id="inline" tabindex={0} delay={props.delay ?? 0} closeDelay={0} data-testid="trigger"
      style={{ display: 'inline', 'line-height': '20px', 'pointer-events': 'none' }}>{text}</PreviewCard.Trigger>
    <PreviewCard.Portal keepMounted={props.keepMounted}>
      <PreviewCard.Positioner data-testid="positioner" side={props.side ?? 'bottom'} sideOffset={5}>
        <PreviewCard.Popup data-testid="popup" style={{ width: '80px', height: '40px' }}>Content</PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  </PreviewCard.Root></div>;
}

describe('PreviewCard multiline inline browser qualification', () => {
  beforeEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });
  afterEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });

  browser('with delayed opening / uses the latest hovered line', async () => {
    await render(() => <Inline delay={100} />);
    const trigger = screen.getByTestId('trigger');
    const rects = trigger.getClientRects();
    expect(rects.length).toBeGreaterThan(2);
    hover(trigger, rects[0]);
    fireEvent.mouseMove(trigger, { clientX: rects[1].left + rects[1].width / 2, clientY: rects[1].top + rects[1].height / 2 }); flush();
    expect(screen.queryByTestId('positioner')).toBeNull();
    await waitFor(() => near(screen.getByTestId('positioner').getBoundingClientRect().top, rects[1].bottom + 5));
  });

  browser('keeps the popup aligned after page scroll', async () => {
    const previousHeight = document.body.style.height;
    const previousScroll = window.scrollY;
    try {
      document.body.style.height = '4000px';
      await render(() => <><div style={{ height: '1200px' }} /><Inline /></>);
      window.scrollTo(0, 1000);
      await waitFor(() => expect(window.scrollY).toBe(1000));
      const trigger = screen.getByTestId('trigger');
      const rects = trigger.getClientRects();
      expect(rects.length).toBeGreaterThan(2);
      hover(trigger, rects[1]);
      await waitFor(() => near(screen.getByTestId('positioner').getBoundingClientRect().top, rects[1].bottom + 5));
      window.scrollTo(0, 1050);
      await waitFor(() => expect(window.scrollY).toBe(1050));
      await waitFor(() => near(screen.getByTestId('positioner').getBoundingClientRect().top, trigger.getClientRects()[1].bottom + 5));
    } finally {
      document.body.style.height = previousHeight;
      window.scrollTo(0, previousScroll);
    }
  });

  browser('re-anchors to a newly entered line while reopening during close transition', async () => {
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    await render(() => <>
      <style>{`@keyframes inline-exit { to { opacity: .01 } }
        [data-testid="popup"][data-ending-style] { animation: inline-exit 1000ms linear; }`}</style>
      <Inline />
    </>);
    const trigger = screen.getByTestId('trigger');
    const rects = trigger.getClientRects();
    expect(rects.length).toBeGreaterThan(2);
    hover(trigger, rects[0]);
    const positioner = screen.getByTestId('positioner');
    await waitFor(() => near(positioner.getBoundingClientRect().top, rects[0].bottom + 5));
    fireEvent.mouseLeave(trigger); flush();
    await waitFor(() => expect(screen.getByTestId('popup')).toHaveAttribute('data-ending-style'));
    hover(trigger, rects[1]);
    await waitFor(() => near(positioner.getBoundingClientRect().top, rects[1].bottom + 5));
  });

  browser('positions the popup relative to the side-aligned rect when open is controlled', async () => {
    await render(() => <Inline open />);
    const rects = screen.getByTestId('trigger').getClientRects();
    expect(rects.length).toBeGreaterThan(2);
    await waitFor(() => near(screen.getByTestId('positioner').getBoundingClientRect().top, rects[rects.length - 1].bottom + 5));
  });

  browser('clears hovered-line coords after close before controlled reopen of the same trigger', async () => {
    let change!: (open: boolean) => Promise<void>;
    const view = await renderProps<InlineProps>((props) => <Inline {...props} onOpenChange={(next) => { void change(next); }} />, { open: false, triggerId: 'inline', keepMounted: true });
    change = (open) => view.setProps({ open });
    const trigger = screen.getByTestId('trigger');
    const rects = trigger.getClientRects();
    expect(rects.length).toBeGreaterThan(2);
    hover(trigger, rects[1]);
    const positioner = screen.getByTestId('positioner');
    await waitFor(() => near(positioner.getBoundingClientRect().top, rects[1].bottom + 5));
    await change(false);
    await waitFor(() => expect(positioner).toHaveAttribute('hidden'));
    await change(true);
    await waitFor(() => near(positioner.getBoundingClientRect().top, rects[rects.length - 1].bottom + 5));
  });

  browser('positions the popup relative to the side-aligned rect when opened via focus', async () => {
    const view = await render(() => <Inline side="top" />);
    const trigger = screen.getByTestId('trigger');
    const rects = trigger.getClientRects();
    expect(rects.length).toBeGreaterThan(2);
    const scrollY = window.scrollY;
    await view.user.tab();
    expect(trigger).toHaveFocus();
    expect(window.scrollY).toBe(scrollY);
    await waitFor(() => expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'top'));
    await waitFor(() => near(screen.getByTestId('positioner').getBoundingClientRect().top, rects[0].top - 40 - 5));
    const positionerRect = screen.getByTestId('positioner').getBoundingClientRect();
    expect(positionerRect.left).toBeGreaterThanOrEqual(rects[0].left - 10);
    expect(positionerRect.left).toBeLessThanOrEqual(rects[0].right + 10);
    const positioner = screen.getByTestId('positioner');
    near(Number.parseFloat(positioner.style.getPropertyValue(PreviewCardPositionerCssVariables.anchorWidth)), rects[0].width);
    near(Number.parseFloat(positioner.style.getPropertyValue(PreviewCardPositionerCssVariables.anchorHeight)), trigger.getBoundingClientRect().height);
  });

  browser('clears hovered-line coords when opened via focus', async () => {
    let acceptFocus!: (open: boolean) => Promise<void>;
    const view = await renderProps<InlineProps>((props) => <Inline {...props} onOpenChange={(next, details) => {
      if (details.reason === 'trigger-focus') void acceptFocus(next);
    }} />, { open: false, triggerId: 'inline', keepMounted: true, side: 'top' });
    acceptFocus = (open) => view.setProps({ open });
    const trigger = screen.getByTestId('trigger');
    const rects = trigger.getClientRects();
    expect(rects.length).toBeGreaterThan(2);
    hover(trigger, rects[1]);
    expect(screen.getByTestId('positioner')).toHaveAttribute('hidden');
    const scrollY = window.scrollY;
    await view.user.tab();
    expect(trigger).toHaveFocus();
    expect(window.scrollY).toBe(scrollY);
    await waitFor(() => expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'top'));
    await waitFor(() => near(screen.getByTestId('positioner').getBoundingClientRect().top, rects[0].top - 40 - 5));
    const positioner = screen.getByTestId('positioner');
    // Cleared pointer coordinates must restore the first line's width and the
    // source's full-span vertical reference, rather than the hovered line box.
    near(Number.parseFloat(positioner.style.getPropertyValue(PreviewCardPositionerCssVariables.anchorWidth)), rects[0].width);
    near(Number.parseFloat(positioner.style.getPropertyValue(PreviewCardPositionerCssVariables.anchorHeight)), trigger.getBoundingClientRect().height);
  });

  browser('ignores stale hovered coords when a controlled trigger switch reuses the popup', async () => {
    let setOpen!: (open: boolean) => Promise<void>;
    const view = await renderProps<{ open: boolean; triggerId: string }>((props) => <>
      <PreviewCard.Root open={props.open} triggerId={props.triggerId} onOpenChange={(next) => { void setOpen(next); }}>
        <div style={{ width: '140px', position: 'fixed', top: '100px', left: '100px' }}><PreviewCard.Trigger href="#" id="one" delay={0} data-testid="one" style={{ 'pointer-events': 'none' }}>{text}</PreviewCard.Trigger></div>
        <div style={{ width: '140px', position: 'fixed', top: '250px', left: '100px' }}><PreviewCard.Trigger href="#" id="two" delay={0} data-testid="two" style={{ 'pointer-events': 'none' }}>{text}</PreviewCard.Trigger></div>
        <PreviewCard.Portal><PreviewCard.Positioner data-testid="positioner" side="bottom" sideOffset={5}><PreviewCard.Popup style={{ width: '80px', height: '40px' }}>Content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
      </PreviewCard.Root>
    </>, { open: false, triggerId: 'one' });
    setOpen = (open) => view.setProps({ open });
    const first = screen.getByTestId('one').getClientRects();
    const second = screen.getByTestId('two').getClientRects();
    expect(first.length).toBeGreaterThan(2);
    hover(screen.getByTestId('one'), first[0]);
    await waitFor(() => near(screen.getByTestId('positioner').getBoundingClientRect().top, first[0].bottom + 5));
    const positioner = screen.getByTestId('positioner');
    await view.setProps({ triggerId: 'two' });
    await waitFor(() => near(positioner.getBoundingClientRect().top, second[second.length - 1].bottom + 5));
    expect(screen.getByTestId('positioner')).toBe(positioner);
  });

  browser('uses the hovered line with a custom anchor in a clipped keepMounted portal', async () => {
    let anchor: HTMLAnchorElement | null = null;
    let container: HTMLDivElement | null = null;
    await render(() => <>
      <div ref={(element) => { container = element; }} data-testid="container" />
      <PreviewCard.Root>
        <div style={{ width: '140px', position: 'fixed', left: '100px', top: '80px' }}>
          <PreviewCard.Trigger href="#" ref={(element) => { anchor = element; }} delay={0} data-testid="trigger" style={{ 'pointer-events': 'none' }}>{text}</PreviewCard.Trigger>
        </div>
        <PreviewCard.Portal keepMounted container={() => container}>
          <PreviewCard.Positioner anchor={() => anchor} collisionBoundary={{ x: 0, y: 0, width: 300, height: 120 }} collisionPadding={0} side="bottom" sideOffset={5} data-testid="positioner">
            <PreviewCard.Popup style={{ width: '80px', height: '40px' }}>Content</PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </PreviewCard.Root>
    </>);
    const trigger = screen.getByTestId('trigger');
    const rects = trigger.getClientRects();
    expect(rects.length).toBeGreaterThan(2);
    hover(trigger, rects[1]);
    const positioner = screen.getByTestId('positioner');
    await waitFor(() => expect(positioner).toHaveAttribute('data-side', 'top'));
    expect(screen.getByTestId('container')).toContainElement(positioner);
    await waitSingleFrame();
    near(positioner.getBoundingClientRect().top, rects[1].top - 40 - 5);
  });
});
import { useUnscaledBrowserFrame } from '../../../../../test/harness/unscaled-frame';
useUnscaledBrowserFrame();
