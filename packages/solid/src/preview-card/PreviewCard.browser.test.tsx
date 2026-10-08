import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import { flush } from 'solid-js';
import { advanceTimers, browserCase, createRenderer, fireEvent, screen, waitFor, waitForAnimations, waitSingleFrame } from '../../test';
import { PreviewCard } from './index';
import { CardFixture } from './PreviewCard.fixture';

const { render, renderProps } = createRenderer();
const rootSource = 'packages/react/src/preview-card/root/PreviewCardRoot.detached-triggers.test.tsx';
const positionSource = 'packages/react/src/preview-card/positioner/PreviewCardPositioner.test.tsx';
const viewportSource = 'packages/react/src/preview-card/viewport/PreviewCardViewport.test.tsx';
const browser = (source: string, title: string, test: () => Promise<void>) => browserCase({ source, case: title, environment: 'browser', issue: 'bsolid-browser' }, test);

describe('PreviewCard browser qualification (retained assertions)', () => {
  beforeEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = false; });
  afterEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });

  for (const sameTrigger of [false, true]) {
    for (const completed of [false, true]) {
      browser(rootSource, `${sameTrigger ? 'same-trigger' : 'A-to-B'} hover ${completed ? 'after completed close respects delay' : 'during close reopens immediately'}`, async () => {
        const handle = PreviewCard.createHandle<number>();
        const view = await render(() => <>
          <style>{`@keyframes preview-exit { to { opacity: .01 } }
            .preview-exit[data-ending-style] { animation: preview-exit 1000ms linear; }`}</style>
          <PreviewCard.Trigger href="#one" handle={handle} id="one" payload={1} delay={600} closeDelay={0}>One</PreviewCard.Trigger>
          <PreviewCard.Trigger href="#two" handle={handle} id="two" payload={2} delay={600} closeDelay={0}>Two</PreviewCard.Trigger>
          <PreviewCard.Root handle={handle}>{(context) => <PreviewCard.Portal keepMounted>
            <PreviewCard.Positioner data-testid="positioner"><PreviewCard.Popup class="preview-exit" data-testid="popup">{context.payload}</PreviewCard.Popup></PreviewCard.Positioner>
          </PreviewCard.Portal>}</PreviewCard.Root>
        </>);
        const first = screen.getByRole('link', { name: 'One' });
        const next = screen.getByRole('link', { name: sameTrigger ? 'One' : 'Two' });
        await view.user.hover(first);
        await waitFor(() => expect(screen.getByTestId('popup')).toHaveAttribute('data-open'));
        const popup = screen.getByTestId('popup');
        const positioner = screen.getByTestId('positioner');
        await view.user.unhover(first);
        await waitFor(() => expect(popup).toHaveAttribute('data-ending-style'));
        if (completed) {
          await waitForAnimations(popup);
          await waitFor(() => expect(positioner).toHaveAttribute('hidden'));
        }
        if (completed) {
          vi.useFakeTimers();
          fireEvent.mouseEnter(next); fireEvent.mouseMove(next); flush();
          expect(popup).toHaveAttribute('data-closed');
          await advanceTimers(599);
          expect(popup).toHaveAttribute('data-closed');
          await advanceTimers(1);
          expect(popup).toHaveAttribute('data-open');
        } else {
          await view.user.hover(next);
          await waitFor(() => expect(popup).toHaveAttribute('data-open'), { timeout: 200 });
        }
        expect(popup.textContent).toBe(sameTrigger ? '1' : '2');
        expect(screen.getByTestId('popup')).toBe(popup);
        expect(screen.getByTestId('positioner')).toBe(positioner);
        view.unmount();
      });
    }
  }

  for (const offset of ['number', 'function'] as const) {
    browser(positionSource, `sideOffset and alignOffset (${offset})`, async () => {
      await render(() => <CardFixture variant="contained" root={{ open: true }}
        trigger={{ style: { display: 'block', position: 'fixed', left: '200px', top: '150px', width: '72px', height: '36px' } }}
        positioner={{ side: 'bottom', align: 'start', sideOffset: offset === 'number' ? 7 : () => 7, alignOffset: offset === 'number' ? 9 : () => 9 }}
        popup={{ style: { width: '52px', height: '24px' } }} />);
      const trigger = screen.getByRole('link', { name: 'Link' });
      const positioner = screen.getByTestId('positioner');
      await waitFor(() => expect(Math.abs(positioner.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom - 7)).toBeLessThanOrEqual(1));
      expect(Math.abs(positioner.getBoundingClientRect().left - trigger.getBoundingClientRect().left - 9)).toBeLessThanOrEqual(1);
    });
  }

  browser(positionSource, 'positions the popup relative to the hovered line; preserves line while open', async () => {
    await render(() => <div style={{ width: '140px', margin: '100px' }}><PreviewCard.Root>
      <PreviewCard.Trigger delay={0} data-testid="inline-trigger" style={{ display: 'inline', 'line-height': '20px', 'pointer-events': 'none' }}>
        This is a long link which wraps over several lines to check inline reference positioning
      </PreviewCard.Trigger>
      <PreviewCard.Portal><PreviewCard.Positioner data-testid="positioner" side="bottom" sideOffset={5}>
        <PreviewCard.Popup style={{ width: '80px', height: '40px' }}>Preview</PreviewCard.Popup>
      </PreviewCard.Positioner></PreviewCard.Portal>
    </PreviewCard.Root></div>);
    const trigger = screen.getByTestId('inline-trigger');
    const rects = trigger.getClientRects();
    expect(rects.length).toBeGreaterThan(2);
    const line = rects[1];
    fireEvent.mouseEnter(trigger, { clientX: line.left + line.width / 2, clientY: line.top + line.height / 2 }); flush();
    const positioner = screen.getByTestId('positioner');
    await waitFor(() => expect(Math.abs(positioner.getBoundingClientRect().top - line.bottom - 5)).toBeLessThanOrEqual(2));
    fireEvent.mouseLeave(trigger);
    fireEvent.mouseEnter(trigger, { clientX: rects[0].left + 2, clientY: rects[0].top + 2 }); flush();
    trigger.ownerDocument.defaultView!.dispatchEvent(new Event('resize'));
    await waitSingleFrame();
    expect(Math.abs(positioner.getBoundingClientRect().top - line.bottom - 5)).toBeLessThanOrEqual(2);
  });

  browser(rootSource, 'repositions on keepMounted reopen and retains popup/positioner identity', async () => {
    const handle = PreviewCard.createHandle<number>();
    await render(() => <>
      <PreviewCard.Trigger href="#" handle={handle} id="one" style={{ position: 'fixed', left: '100px', top: '100px' }}>One</PreviewCard.Trigger>
      <PreviewCard.Trigger href="#" handle={handle} id="two" style={{ position: 'fixed', left: '300px', top: '100px' }}>Two</PreviewCard.Trigger>
      <PreviewCard.Root handle={handle}><PreviewCard.Portal keepMounted><PreviewCard.Positioner data-testid="positioner" align="start"><PreviewCard.Popup data-testid="popup">Content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal></PreviewCard.Root>
    </>);
    const positioner = screen.getByTestId('positioner');
    const popup = screen.getByTestId('popup');
    for (const [id, name] of [['one', 'One'], ['two', 'Two']]) {
      handle.open(id); flush();
      await waitFor(() => expect(Math.abs(positioner.getBoundingClientRect().left - screen.getByRole('link', { name }).getBoundingClientRect().left)).toBeLessThanOrEqual(1));
      expect(screen.getByTestId('popup')).toBe(popup);
      expect(screen.getByTestId('positioner')).toBe(positioner);
      handle.close(); flush();
      await waitFor(() => expect(positioner).toHaveAttribute('hidden'));
    }
  });

  for (const animation of [false, true]) {
    for (const opening of [false, true]) {
      browser('packages/react/src/preview-card/root/PreviewCardRoot.test.tsx', `onOpenChangeComplete ${opening ? 'open' : 'close'} ${animation ? 'after animation' : 'without animation'}`, async () => {
        const completed: boolean[] = [];
        const view = await renderProps((props: { open: boolean }) => <>
          {animation && <style>{`@keyframes preview-completion { from { opacity: .2 } to { opacity: 1 } }
            .preview-completion[data-starting-style], .preview-completion[data-ending-style] { animation: preview-completion 120ms linear; }`}</style>}
          <CardFixture variant="contained" root={{ get open() { return props.open; }, onOpenChangeComplete: (value) => { completed.push(value); } }} popup={{ class: 'preview-completion' }} />
        </>, { open: !opening });
        if (!opening) await waitFor(() => expect(completed).toEqual([true]));
        else expect(completed).toEqual([]);
        await view.setProps({ open: opening });
        // Entry-style removal may cancel the entry animation; the source gate
        // is the completion callback, not a snapshot of a canceled WAAPI promise.
        if (animation && !opening) await waitForAnimations(screen.getByTestId('popup'));
        await waitFor(() => expect(completed.at(-1)).toBe(opening));
        if (!opening) await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
      });
    }
  }

  browser('packages/react/src/preview-card/root/PreviewCardRoot.test.tsx', 'onOpenChangeComplete does not get called on mount when not open', async () => {
    const completed: boolean[] = [];
    await render(() => <CardFixture variant="contained" root={{ onOpenChangeComplete: (value) => { completed.push(value); } }} />);
    await waitSingleFrame();
    expect(completed).toEqual([]);
  });

  for (const side of ['left', 'inline-start'] as const) {
    for (const offset of ['sideOffset', 'alignOffset'] as const) {
      browser(positionSource, `${offset} receives the latest ${side === 'left' ? 'physical' : 'logical'} collision-flipped side`, async () => {
        let observed = '';
        await render(() => <CardFixture variant="contained" root={{ open: true }}
          trigger={{ style: { display: 'block', position: 'fixed', left: '0', top: '100px', width: '72px', height: '36px' } }}
          positioner={{ side, collisionPadding: 5, collisionAvoidance: { side: 'flip', align: 'flip', fallbackAxisSide: 'none' }, [offset]: (data: { side: string }) => { observed = data.side; return 0; } }}
          popup={{ style: { width: '52px', height: '24px' } }} />);
        await waitFor(() => expect(observed).toBe(side === 'left' ? 'right' : 'inline-end'));
      });
      browser(positionSource, `${offset} receives collision-flipped alignment`, async () => {
        let observed = '';
        await render(() => <CardFixture variant="contained" root={{ open: true }}
          trigger={{ style: { display: 'block', position: 'fixed', left: '100px', bottom: '0', width: '72px', height: '36px' } }}
          positioner={{ side: 'right', align: 'start', collisionPadding: 5, [offset]: (data: { align: string }) => { observed = data.align; return 0; } }}
          popup={{ style: { width: '52px', height: '60px' } }} />);
        await waitFor(() => expect(observed).toBe('end'));
      });
    }
  }

  browser(positionSource, 'uses transform positioning without Viewport', async () => {
    await render(() => <CardFixture variant="contained" root={{ open: true }} />);
    await waitFor(() => expect(screen.getByTestId('positioner').style.transform).not.toBe(''));
  });

  for (const direction of [
    { from: [10, 10], to: [200, 100], tokens: ['right', 'down'] },
    { from: [200, 100], to: [10, 10], tokens: ['left', 'up'] },
    { from: [10, 50], to: [200, 52], tokens: ['right'] },
    { from: [50, 10], to: [52, 100], tokens: ['down'] },
    { from: [50, 50], to: [52, 52], tokens: [] },
    { from: [200, 10], to: [10, 100], tokens: ['left', 'down'] },
    { from: [10, 100], to: [200, 10], tokens: ['right', 'up'] },
  ]) {
    browser(viewportSource, `morphing containers / activation direction ${direction.tokens.join(' ') || 'within tolerance'}`, async () => {
      const handle = PreviewCard.createHandle<number>();
      await render(() => <>
        <style>{`@keyframes preview-morph { from { opacity: .5 } to { opacity: 1 } }
          [data-transitioning] > [data-current], [data-transitioning] > [data-previous] { animation: preview-morph 500ms; }`}</style>
        <PreviewCard.Trigger href="#" handle={handle} id="one" payload={1} delay={0} style={{ position: 'fixed', left: `${direction.from[0]}px`, top: `${direction.from[1]}px` }}>One</PreviewCard.Trigger>
        <PreviewCard.Trigger href="#" handle={handle} id="two" payload={2} delay={0} style={{ position: 'fixed', left: `${direction.to[0]}px`, top: `${direction.to[1]}px` }}>Two</PreviewCard.Trigger>
        <PreviewCard.Root handle={handle}>{(context) => <PreviewCard.Portal><PreviewCard.Positioner data-testid="positioner"><PreviewCard.Popup data-testid="popup">
          <PreviewCard.Viewport data-testid="viewport"><span>Content {context.payload}</span></PreviewCard.Viewport>
        </PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>}</PreviewCard.Root>
      </>);
      handle.open('one'); flush(); await waitSingleFrame();
      const popup = screen.getByTestId('popup');
      const current = popup.querySelector('[data-current]');
      expect(current?.textContent).toBe('Content 1');
      handle.open('two'); flush();
      const viewport = screen.getByTestId('viewport');
      await waitFor(() => expect(viewport.querySelector('[data-previous]')).not.toBeNull());
      expect(viewport.querySelector('[data-previous]')).toHaveAttribute('inert');
      expect(viewport.querySelector('[data-previous]')?.textContent).toBe('Content 1');
      expect(viewport.querySelector('[data-current]')).not.toBe(current);
      expect(viewport.querySelector('[data-current]')?.textContent).toBe('Content 2');
      expect(viewport).toHaveAttribute('data-activation-direction');
      expect((viewport.getAttribute('data-activation-direction') ?? '').split(' ').filter(Boolean).sort()).toEqual([...direction.tokens].sort());
      expect(screen.getByTestId('positioner').style.transform).toBe('');
      await waitFor(() => expect(viewport.querySelector('[data-previous]')).toBeNull());
      expect(viewport.querySelector('[data-current]')).toBeVisible();
      expect(viewport.querySelector('[data-current]')?.textContent).toBe('Content 2');
      expect(popup.style.scale).toBe('');
      // Rapid switches must cancel obsolete content lifetimes and finish at the last payload.
      handle.open('one'); flush(); await waitSingleFrame();
      handle.open('two'); flush(); await waitSingleFrame();
      handle.open('one'); flush();
      await waitFor(() => expect(viewport.querySelector('[data-previous]')).toBeNull());
      expect(viewport.querySelector('[data-current]')?.textContent).toBe('Content 1');
      expect(screen.getByTestId('popup')).toBe(popup);
    });
  }
});
