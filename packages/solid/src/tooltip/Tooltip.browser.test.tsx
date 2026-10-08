import { beforeEach, afterEach, describe, expect, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { createSignal } from 'solid-js';
import { createRenderer, screen, fireEvent, browserCase, waitFor, waitSingleFrame, resetBrowserPointer } from '../../test';
import { Tooltip } from './index';
import { ToolbarRoot } from '../toolbar/root/ToolbarRoot';
import { ToolbarButton } from '../toolbar/button/ToolbarButton';
import { Fixture, settle, upstream } from './Tooltip.test-utils';
import ExampleTooltip from '../../../../docs/demos/tooltip/hero/css-modules';

const { render, renderProps } = createRenderer();
const check = (file: string, title: string, run: () => Promise<void>) => browserCase({
  source: `${upstream}${file}`, case: title, environment: 'browser', issue: 'bsolid-browser',
}, run);
// Replay: rtk pnpm test:chromium Tooltip --no-watch
describe('Tooltip browser geometry and interrupted transitions', () => {
  beforeEach(() => resetBrowserPointer());
  beforeEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = false; });
  afterEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });
  check('trigger/TooltipTrigger.test.tsx', 'docs hero opens on a trusted no-click hover over its SVG icon', async () => {
    await render(() => <ExampleTooltip />);
    const trigger = screen.getByRole('button', { name: 'Bold' });
    const icon = trigger.querySelector('path')!;
    await userEvent.hover(icon);
    const popup = await screen.findByText('Bold');
    await waitFor(() => expect(Number(getComputedStyle(popup).opacity)).toBe(1));
    expect(popup).toBeVisible();
    // The canonical Tooltip family intentionally supplies neither of these.
    // Live docs checks must not mistake a missing tooltip role for a failed open.
    expect(popup).not.toHaveAttribute('role');
    expect(trigger).not.toHaveAttribute('aria-describedby');
    expect(screen.getByRole('button', { name: 'Bold' })).toBe(trigger);
    expect(trigger.querySelector('path')).toBe(icon);
    expect(trigger).toHaveAttribute('data-popup-open');
    await userEvent.unhover(trigger);
    await waitFor(() => expect(screen.queryByText('Bold')).toBeNull());
  });
  for (const animated of [false, true]) {
    check('root/TooltipRoot.test.tsx', `onOpenChangeComplete/open and close/animated=${animated}`, async () => {
      const completed = vi.fn();
      const view = await renderProps((props: { open: boolean }) => <>
        <style>{animated ? '.tooltip[data-starting-style], .tooltip[data-ending-style] { animation: tooltip-fade 10ms; } @keyframes tooltip-fade { to { opacity: 0; } }' : ''}</style>
        <Fixture root={{ open: props.open, onOpenChangeComplete: completed }} popup={{ class: 'tooltip' }} />
      </>, { open: false });
      expect(completed).not.toHaveBeenCalled();
      await view.setProps({ open: true }); await waitFor(() => expect(completed).toHaveBeenCalledWith(true));
      expect(completed.mock.calls[0]?.[0]).toBe(true);
      expect(screen.getByTestId('popup')).toBeInTheDocument();
      await view.setProps({ open: false }); await waitFor(() => expect(completed).toHaveBeenLastCalledWith(false));
      expect(screen.queryByTestId('popup')).toBeNull();
    });
  }
  check('root/TooltipRoot.test.tsx', 'inline opacity: 0 is removed before user CSS transitions run', async () => {
    await render(() => <><style>{'.tooltip { transition: opacity 200ms; opacity: 1; }'}</style><Fixture trigger={{ delay: 0 }} popup={{ class: 'tooltip' }} /></>);
    await userEvent.hover(screen.getByText('Toggle')); const popup = await screen.findByTestId('popup');
    await waitFor(() => expect(Number(getComputedStyle(popup).opacity)).toBe(1));
    expect(popup.getAnimations().filter(animation => (animation as CSSTransition).transitionProperty === 'opacity')).toHaveLength(0);
  });
  check('trigger/TooltipTrigger.test.tsx', 'opens on delayed hover when rendered as an aria-disabled toolbar button', async () => {
    const changed = vi.fn();
    await render(() => <ToolbarRoot><Fixture root={{ onOpenChange: changed }} trigger={{ delay: 20, render: props => <ToolbarButton {...props} disabled /> }} /></ToolbarRoot>);
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    expect(screen.getByRole('toolbar')).toContainElement(trigger);
    expect(trigger).not.toHaveAttribute('disabled'); expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await userEvent.hover(trigger); await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument());
    expect(changed).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'trigger-hover', event: expect.objectContaining({ isTrusted: true }) }));
  });
  for (const arrangement of ['contained', 'detached', 'multiple-detached'] as const) {
    check('root/TooltipRoot.test.tsx', `${arrangement}/focus, blur and instant metadata`, async () => {
      await render(() => <Fixture arrangement={arrangement} trigger={{ delay: 0 }} />);
      const trigger = screen.getByText('Toggle'); trigger.focus(); await settle();
      expect(screen.getByTestId('popup')).toHaveAttribute('data-instant', 'focus');
      trigger.blur(); await settle(); await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
      await userEvent.hover(trigger); await waitFor(() => expect(screen.getByTestId('popup')).not.toHaveAttribute('data-instant'));
    });
  }
  for (const detached of [false, true]) {
    for (const interaction of ['hover', 'focus'] as const) {
      check('root/TooltipRoot.detached-triggers.test.tsx', `any trigger opens and closes/${interaction}/detached=${detached}`, async () => {
        await render(() => <MultipleTriggers detached={detached} />);
        expect(screen.queryByTestId('multi-popup')).toBeNull();
        for (const name of ['Trigger 1', 'Trigger 2', 'Trigger 3']) {
          const trigger = screen.getByText(name);
          if (interaction === 'hover') { fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger); }
          else trigger.focus();
          await waitFor(() => expect(screen.getByTestId('multi-popup')).toBeVisible());
          if (interaction === 'hover') fireEvent.mouseLeave(trigger);
          else trigger.blur();
          await waitFor(() => expect(screen.queryByTestId('multi-popup')).toBeNull());
        }
      });
    }
    check('root/TooltipRoot.detached-triggers.test.tsx', `hover payload, custom-id focus handoff and host reuse/detached=${detached}`, async () => {
      await render(() => <MultipleTriggers detached={detached} customId />);
      const first = screen.getByText('Trigger 1'); const second = screen.getByText('Trigger 2');
      fireEvent.mouseEnter(first); fireEvent.mouseMove(first);
      await waitFor(() => expect(screen.getByTestId('multi-content').textContent).toBe('1'));
      fireEvent.mouseLeave(first); fireEvent.mouseEnter(second); fireEvent.mouseMove(second);
      await waitFor(() => expect(screen.getByTestId('multi-content').textContent).toBe('2'));
      first.focus();
      await waitFor(() => expect(screen.getByTestId('multi-content').textContent).toBe('1'));
      const popup = screen.getByTestId('multi-popup'); const positioner = screen.getByTestId('multi-positioner');
      second.focus();
      await waitFor(() => expect(screen.getByTestId('multi-content').textContent).toBe('2'));
      expect(second).toHaveAttribute('id', 'custom-button');
      expect(second).toHaveAttribute('data-popup-open');
      expect(screen.getByTestId('multi-popup')).toBe(popup);
      expect(screen.getByTestId('multi-positioner')).toBe(positioner);
    });
    for (const canceled of [false, true]) {
      check('root/TooltipRoot.detached-triggers.test.tsx', `active trigger removal/detached=${detached}/canceled=${canceled}`, async () => {
        const changed = vi.fn((open: boolean, details: Tooltip.Root.ChangeEventDetails) => { if (!open && canceled) details.cancel(); });
        const view = await renderProps((props: { showFirst: boolean }) => <MultipleTriggers detached={detached} showFirst={props.showFirst}
          root={{ defaultOpen: true, defaultTriggerId: 'first', onOpenChange: changed }} />, { showFirst: true });
        await waitFor(() => expect(screen.getByTestId('multi-content')).toHaveTextContent('1'));
        await view.setProps({ showFirst: false });
        expect(screen.queryByText('Trigger 1')).toBeNull();
        await waitFor(() => expect(changed).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'none' })));
        expect(screen.getByText('Trigger 2')).not.toHaveAttribute('data-popup-open');
        if (canceled) expect(screen.getByTestId('multi-content')).toHaveTextContent('1');
        else await waitFor(() => expect(screen.queryByTestId('multi-content')).toBeNull());
      });
    }
    check('root/TooltipRoot.detached-triggers.test.tsx', `initially open second trigger payload/detached=${detached}`, async () => {
      await render(() => <MultipleTriggers detached={detached} root={{ defaultOpen: true, defaultTriggerId: 'second' }} />);
      await waitFor(() => expect(screen.getByTestId('multi-popup').textContent).toBe('2'));
    });
    check('root/TooltipRoot.detached-triggers.test.tsx', `controlled payload and anchor geometry/detached=${detached}`, async () => {
      const view = await renderProps<{ open: boolean; triggerId: string | null }>(props => <MultipleTriggers detached={detached}
        root={{ open: props.open, triggerId: props.triggerId }} />, { open: false, triggerId: null });
      for (const [triggerId, payload] of [['first', '1'], ['second', '2']] as const) {
        await view.setProps({ open: true, triggerId });
        await waitFor(() => expect(screen.getByTestId('multi-content').textContent).toBe(payload));
        if (detached) await waitFor(() => expect(Math.abs(screen.getByTestId('multi-positioner').getBoundingClientRect().left -
          screen.getByText(`Trigger ${payload}`).getBoundingClientRect().left)).toBeLessThanOrEqual(1));
      }
      await view.setProps({ open: false });
      await waitFor(() => expect(screen.queryByTestId('multi-content')).toBeNull());
    });
  }
  for (const interaction of ['hover', 'focus'] as const) {
    check('root/TooltipRoot.detached-triggers.test.tsx', `disabled detached trigger closes another active trigger/${interaction}`, async () => {
      await render(() => <MultipleTriggers detached disabledSecond />);
      const first = screen.getByText('Trigger 1'); const second = screen.getByText('Trigger 2');
      if (interaction === 'hover') { fireEvent.mouseEnter(first); fireEvent.mouseMove(first); }
      else first.focus();
      await waitFor(() => expect(screen.getByTestId('multi-content').textContent).toBe('1'));
      if (interaction === 'hover') { fireEvent.mouseLeave(first); fireEvent.mouseEnter(second); fireEvent.mouseMove(second); }
      else second.focus();
      await waitFor(() => expect(screen.queryByTestId('multi-content')).toBeNull());
      expect(second).not.toHaveAttribute('data-popup-open');
    });
  }
  check('root/TooltipRoot.detached-triggers.test.tsx', 'rendered disabled button permits detached hover handoff', async () => {
    await render(() => <MultipleTriggers detached renderedDisabled />);
    const first = screen.getByText('Trigger 1'); const second = screen.getByText('Trigger 2');
    expect(second).toHaveAttribute('disabled');
    fireEvent.mouseEnter(first); fireEvent.mouseMove(first);
    await waitFor(() => expect(screen.getByTestId('multi-content').textContent).toBe('1'));
    fireEvent.mouseLeave(first); fireEvent.mouseEnter(second); fireEvent.mouseMove(second);
    await waitFor(() => expect(screen.getByTestId('multi-content').textContent).toBe('2'));
    expect(second).toHaveAttribute('data-popup-open');
  });
  check('root/TooltipRoot.detached-triggers.test.tsx', 'detached hover switching leaves inline scale empty', async () => {
    await render(() => <MultipleTriggers detached viewport />);
    const first = screen.getByText('Trigger 1'); const second = screen.getByText('Trigger 2');
    fireEvent.mouseEnter(first); fireEvent.mouseMove(first);
    await waitFor(() => expect(screen.getByTestId('multi-content').textContent).toBe('1'));
    fireEvent.mouseLeave(first); fireEvent.mouseEnter(second); fireEvent.mouseMove(second);
    await waitFor(() => expect(screen.getByTestId('multi-content').textContent).toBe('2'));
    expect(screen.getByTestId('multi-popup').style.scale).toBe('');
  });
  check('viewport/TooltipViewport.test.tsx', 'Viewport mirrors instant focus metadata in the browser', async () => {
    await render(() => <Fixture viewport trigger={{ delay: 0, closeDelay: 0 }} />);
    screen.getByText('Toggle').focus();
    await waitFor(() => expect(screen.getByTestId('viewport')).toHaveAttribute('data-instant', 'focus'));
  });
  for (const axis of ['x', 'y', 'both'] as const) {
    check('root/TooltipRoot.test.tsx', `first delayed hover, reentry and disabling cursor tracking/axis=${axis}`, async () => {
      const view = await renderProps<{ axis: 'none' | 'x' | 'y' | 'both' }>((props) => <div style={{ padding: '150px' }}>
        <Fixture root={{ trackCursorAxis: props.axis }} trigger={{ delay: 100, style: { width: '300px', height: '100px' } }}
          positioner={{ side: axis === 'y' ? 'right' : 'bottom' }} popup={{ style: { width: '40px', height: '20px' } }} />
      </div>, { axis });
      const trigger = screen.getByText('Toggle'); const rect = trigger.getBoundingClientRect();
      for (const fraction of [0.8, 0.2]) {
        const clientX = rect.left + rect.width * fraction; const clientY = rect.top + rect.height * fraction;
        await userEvent.hover(trigger, { position: { x: rect.width * fraction, y: rect.height * fraction } });
        await waitFor(() => {
          const popup = screen.getByTestId('positioner').getBoundingClientRect();
          expect(Math.abs(axis === 'y' ? popup.top + popup.height / 2 - clientY : popup.left + popup.width / 2 - clientX)).toBeLessThanOrEqual(2);
        });
        await userEvent.unhover(trigger); await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
      }
      await view.setProps({ axis: 'none' }); await userEvent.hover(trigger, { position: { x: 240, y: 80 } });
      await waitFor(() => {
        const popup = screen.getByTestId('positioner').getBoundingClientRect();
        expect(Math.abs(axis === 'y' ? popup.top + popup.height / 2 - (rect.top + rect.height / 2) : popup.left + popup.width / 2 - (rect.left + rect.width / 2))).toBeLessThanOrEqual(2);
      });
    });
  }
  for (const disabled of [false, true]) {
    check('root/TooltipRoot.test.tsx', `trigger to popup corridor/disableHoverablePopup=${disabled}`, async () => {
      await render(() => <div style={{ padding: '100px' }}><Fixture root={{ disableHoverablePopup: disabled }} trigger={{ delay: 0, style: { width: '120px', height: '40px' } }}
        positioner={{ side: 'bottom' }} popup={{ style: { width: '120px', height: '40px' } }} /></div>);
      const trigger = screen.getByText('Toggle'); await userEvent.hover(trigger);
      const popup = await screen.findByTestId('popup'); const rect = popup.getBoundingClientRect();
      fireEvent.mouseLeave(trigger, { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 }); fireEvent.mouseEnter(popup); await settle();
      if (disabled) await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
      else {
        expect(popup).toBeInTheDocument(); fireEvent.mouseLeave(popup, { relatedTarget: document.body, clientX: 0, clientY: 0 });
        await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
      }
    });
  }
  for (const [padding, width, uncentered] of [[40, 20, true], [0, 200, false]] as const) {
    check('arrow/TooltipArrow.test.tsx', `arrow centering/padding=${padding}/width=${width}`, async () => {
      await render(() => <div style={{ position: 'fixed', top: 0, left: 0 }}><Fixture root={{ open: true }}
        trigger={{ style: { width: `${width}px`, height: '20px' } }} positioner={{ side: 'bottom', arrowPadding: padding }}
        arrow={{ style: { width: '10px', height: '10px' } }}
        popup={{ style: { width: '200px', height: '40px' } }} /></div>);
      await waitFor(() => expect(screen.getByTestId('arrow').hasAttribute('data-uncentered')).toBe(uncentered));
    });
  }
  for (const side of ['left', 'top'] as const) {
    check('viewport/TooltipViewport.test.tsx', `far-edge anchoring/${side}`, async () => {
      await render(() => <><style>{'[data-testid="positioner"] { transition: transform 100ms; }'}</style>
        <Fixture root={{ open: true }} viewport trigger={{ style: { position: 'fixed', top: '200px', left: '300px' } }} positioner={{ side }} />
      </>);
      await waitFor(() => expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', side));
      await waitFor(() => expect(screen.getByTestId('positioner').style[side === 'left' ? 'right' : 'bottom']).not.toBe(''));
      expect(screen.getByTestId('positioner').style[side === 'left' ? 'left' : 'top']).toBe('');
    });
  }
  check('positioner/TooltipPositioner.test.tsx', 'transform without Viewport; top/left with Viewport; dynamic mounting', async () => {
    const view = await renderProps((props: { viewport: boolean }) => <Fixture root={{ open: true }} viewport={props.viewport} />, { viewport: false });
    const positioner = screen.getByTestId('positioner'); await waitFor(() => expect(positioner.style.transform).not.toBe(''));
    await view.setProps({ viewport: true }); await waitFor(() => expect(positioner.style.transform).toBe(''));
    await view.setProps({ viewport: false }); await waitFor(() => expect(positioner.style.transform).not.toBe(''));
    expect(screen.getByTestId('positioner')).toBe(positioner);
  });
  for (const kind of ['sideOffset', 'alignOffset'] as const) for (const functional of [false, true]) {
    check('positioner/TooltipPositioner.test.tsx', `${kind}/${functional ? 'function' : 'number'}`, async () => {
      await render(() => <div style={{ position: 'fixed', top: '200px', left: '200px' }}><Fixture root={{ open: true }}
        trigger={{ style: { width: '72px', height: '36px' } }} popup={{ style: { width: '52px', height: '24px' } }}
        positioner={{ side: 'bottom', [kind]: functional ? (data: { anchor: { width: number }; positioner: { width: number } }) => kind === 'sideOffset' ? data.positioner.width + data.anchor.width : data.positioner.width : 7 }} /></div>);
      await waitFor(() => {
        const anchor = screen.getByText('Toggle').getBoundingClientRect(); const popup = screen.getByTestId('positioner').getBoundingClientRect();
        const amount = functional ? kind === 'sideOffset' ? anchor.width + popup.width : popup.width : 7;
        expect(Math.abs(kind === 'sideOffset' ? popup.top - anchor.bottom - amount : popup.left + popup.width / 2 - (anchor.left + anchor.width / 2) - amount)).toBeLessThanOrEqual(1);
        expect({ x: popup.left, y: popup.top }).toEqual({
          x: anchor.left + (anchor.width - popup.width) / 2 + (kind === 'alignOffset' ? amount : 0),
          y: anchor.bottom + (kind === 'sideOffset' ? amount : 0),
        });
      });
    });
  }
  for (const kind of ['sideOffset', 'alignOffset'] as const) for (const side of ['left', 'right', 'inline-start'] as const) {
    check('positioner/TooltipPositioner.test.tsx', `latest resolved side and align in ${kind}/side=${side}`, async () => {
      let resolvedSide: string | undefined; let resolvedAlign: string | undefined;
      await render(() => <Fixture root={{ open: true }} trigger={{ style: { width: '72px', height: '36px' } }} popup={{ style: { width: '52px', height: '24px' } }}
        positioner={{ side, align: side === 'right' ? 'start' : 'center', [kind]: (data: { side: string; align: string }) => { resolvedSide = data.side; resolvedAlign = data.align; return 0; } }} />);
      await waitFor(() => expect(resolvedSide).toBe(side === 'left' ? 'right' : side === 'inline-start' ? 'inline-end' : 'right'));
      if (side === 'right') expect(resolvedAlign).toBe('end');
    });
  }
  check('root/TooltipRoot.test.tsx', 'keeps open across spaced detached triggers without closeDelay', async () => {
    const handle = Tooltip.createHandle();
    const view = await render(() => <Tooltip.Provider><div style={{ display: 'flex', gap: '32px' }}>
      {[1, 2, 3].map(number => <Tooltip.Trigger handle={handle} delay={0}>Trigger {number}</Tooltip.Trigger>)}
    </div><Tooltip.Root handle={handle}><Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="popup">Content</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal></Tooltip.Root></Tooltip.Provider>);
    const triggers = screen.getAllByRole('button'); await userEvent.hover(triggers[0]!); await screen.findByTestId('popup');
    expect(screen.getByTestId('popup')).toBeVisible();
    await userEvent.unhover(triggers[0]!); await userEvent.hover(triggers[1]!); await screen.findByTestId('popup');
    expect(screen.getByTestId('popup')).toBeVisible();
    fireEvent.mouseLeave(triggers[1]!, { relatedTarget: document.body, clientX: 120, clientY: 0 });
    await userEvent.hover(triggers[2]!);
    expect(screen.getByTestId('popup')).toBeVisible();
    fireEvent.mouseMove(document.body, { clientX: 300, clientY: 0 });
    expect(screen.getByTestId('popup')).toBeVisible();
  });
  check('root/TooltipRoot.test.tsx', 'adjacent instant entry permits normal exit and interrupted reentry clears metadata', async () => {
    const view = await render(() => <Tooltip.Provider timeout={30000}><style>{`
      .tooltip { transition: opacity 200ms; }
      .tooltip[data-starting-style], .tooltip[data-ending-style] { opacity: 0; }
      .tooltip[data-instant] { transition: none; }
    `}</style>{['One', 'Two'].map(name => <Tooltip.Root><Tooltip.Trigger delay={0}>{name}</Tooltip.Trigger>
      <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup class="tooltip" data-testid={name}>{name} content</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
    </Tooltip.Root>)}</Tooltip.Provider>);
    const first = screen.getByText('One'); const second = screen.getByText('Two');
    await userEvent.hover(first); const firstPopup = await screen.findByTestId('One');
    expect(firstPopup).not.toHaveAttribute('data-instant');
    await userEvent.unhover(first); await userEvent.hover(second);
    const popup = await screen.findByTestId('Two'); await waitFor(() => expect(popup).toHaveAttribute('data-instant', 'delay'));
    expect(popup.getAnimations()).toHaveLength(0); await userEvent.unhover(second);
    await waitFor(() => expect(popup).toHaveAttribute('data-ending-style'));
    expect(popup).not.toHaveAttribute('data-instant'); expect(popup.getAnimations().length).toBeGreaterThan(0);
    expect(popup.getAnimations()).toHaveLength(1);
    await userEvent.hover(second); await waitFor(() => expect(popup).not.toHaveAttribute('data-ending-style'));
    await userEvent.unhover(second); await userEvent.hover(first);
    await waitFor(() => expect(screen.queryByTestId('Two')).toBeNull());
  });

  const directions = [
    [10, 10, 200, 100, 'down right'], [200, 100, 10, 10, 'left up'],
    [10, 50, 200, 52, 'right'], [50, 10, 52, 100, 'down'],
    [50, 50, 52, 52, ''], [200, 10, 10, 100, 'down left'], [10, 100, 200, 10, 'right up'],
  ] as const;
  for (const [x1, y1, x2, y2, direction] of directions) {
    check('viewport/TooltipViewport.test.tsx', `activation direction/${x1},${y1} to ${x2},${y2}`, async () => {
      await render(() => <Morph positions={[[x1, y1], [x2, y2], [300, 200]]} />);
      screen.getByText('Trigger 1').focus();
      await waitFor(() => expect(screen.getByText('Content 1')).toBeVisible());
      await waitSingleFrame(); screen.getByText('Trigger 2').focus(); await settle();
      await waitFor(() => expect(screen.getByTestId('viewport')).toHaveAttribute('data-activation-direction'));
      await waitFor(() => expect((screen.getByTestId('viewport').getAttribute('data-activation-direction') ?? '').split(' ').filter(Boolean).sort().join(' ')).toBe(direction));
    });
  }
  check('viewport/TooltipViewport.test.tsx', 'morph containers and rapid switches retain latest animation owner', async () => {
    await render(() => <Morph />);
    screen.getByText('Trigger 1').focus(); await waitSingleFrame(); const first = screen.getByText('Content 1').closest('[data-current]');
    screen.getByText('Trigger 2').focus(); await waitSingleFrame();
    await waitFor(() => expect(screen.getByText('Content 2').closest('[data-current]')!.getAnimations()).toHaveLength(1));
    await waitFor(() => expect(document.querySelector('[data-previous]')).toHaveTextContent('Content 1'));
    expect(document.querySelector('[data-previous]')).toHaveAttribute('inert');
    expect(screen.getByText('Content 2').closest('[data-current]')).not.toBe(first);
    screen.getByText('Trigger 3').focus(); await waitSingleFrame();
    expect(document.querySelector('[data-previous]')).toHaveTextContent('Content 2');
    await waitFor(() => expect(document.querySelector('[data-current]')!.getAnimations().length).toBeGreaterThan(0));
    expect(document.querySelector('[data-current]')!.getAnimations()).toHaveLength(1);
    expect(document.querySelector('[data-previous]')).not.toBeNull();
    expect(screen.getByTestId('viewport')).toHaveAttribute('data-transitioning');
    document.querySelectorAll('[data-current], [data-previous]').forEach(node => node.getAnimations().forEach(animation => animation.finish()));
    await waitFor(() => expect(document.querySelector('[data-previous]')).toBeNull());
    expect(screen.getByTestId('viewport')).not.toHaveAttribute('data-transitioning');
    expect(screen.getByTestId('popup').style.scale).toBe('');
    expect(document.querySelector('[data-current]')).toBeVisible();
    expect(screen.getByText('Content 3')).toBeVisible();
  });
  check('viewport/TooltipViewport.test.tsx', 'lagging payload remount restarts entry and retains the previous exit animation', async () => {
    let resolvePayload!: (value: string) => void;
    await render(() => {
      const [payload, setPayload] = createSignal<string | undefined>(undefined);
      resolvePayload = setPayload;
      return <>
        <style>{`
          [data-transitioning] [data-current], [data-transitioning] [data-previous] {
            transition: transform 10s linear, opacity 10s linear;
          }
          [data-transitioning] [data-current][data-starting-style] { transform: translateX(30%); opacity: 0; }
          [data-transitioning] [data-previous][data-ending-style] { transform: translateX(-30%); opacity: 0; }
        `}</style>
        <Tooltip.Root<string>>{state => <>
          <Tooltip.Trigger delay={0} style={{ position: 'absolute', top: '10px', left: '10px', width: '100px', height: '50px' }}>First lagging trigger</Tooltip.Trigger>
          <Tooltip.Trigger delay={0} payload={payload()} style={{ position: 'absolute', top: '100px', left: '200px', width: '100px', height: '50px' }}>Second lagging trigger</Tooltip.Trigger>
          <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="lagging-popup">
            <Tooltip.Viewport data-testid="viewport">Content {String(state.payload)}</Tooltip.Viewport>
          </Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
        </>}</Tooltip.Root>
      </>;
    });
    await waitSingleFrame();
    screen.getByText('First lagging trigger').focus(); await settle();
    await waitFor(() => expect(document.querySelector('[data-current]')).not.toBeNull());
    await waitSingleFrame();
    screen.getByText('Second lagging trigger').focus(); await settle();
    await waitFor(() => expect(document.querySelector('[data-previous]')).not.toBeNull());
    await waitFor(() => expect(document.querySelector('[data-previous]')!.getAnimations().length).toBeGreaterThan(0));
    await waitFor(() => expect(document.querySelector('[data-current]')!.getAnimations().length).toBeGreaterThan(0));
    await waitSingleFrame(); await waitSingleFrame();
    const before = document.querySelector('[data-current]');
    const popup = screen.getByTestId('lagging-popup');
    const viewport = screen.getByTestId('viewport');
    resolvePayload('ready');
    await waitFor(() => expect(document.querySelector('[data-current]')).not.toBe(before));
    expect(screen.getByTestId('lagging-popup')).toBe(popup);
    expect(screen.getByTestId('viewport')).toBe(viewport);
    await waitFor(() => expect(document.querySelector('[data-current]')!.getAnimations().length).toBeGreaterThan(0));
    await waitSingleFrame(); await waitSingleFrame(); await waitSingleFrame(); await waitSingleFrame();
    expect(document.querySelector('[data-previous]')).not.toBeNull();
    expect(screen.getByTestId('viewport')).toHaveAttribute('data-transitioning');
    document.querySelectorAll('[data-current], [data-previous]').forEach(node => node.getAnimations().forEach(animation => animation.finish()));
    await waitFor(() => expect(document.querySelector('[data-previous]')).toBeNull());
    expect(screen.getByTestId('viewport')).not.toHaveAttribute('data-transitioning');
    expect(screen.getByText('Content ready')).toBeVisible();
  });
});

function MultipleTriggers(props: {
  detached: boolean; showFirst?: boolean; disabledSecond?: boolean; renderedDisabled?: boolean;
  customId?: boolean; viewport?: boolean; root?: Tooltip.Root.Props<number>;
}) {
  const handle = Tooltip.createHandle<number>();
  function Triggers() {
    return <div style={{ display: 'flex', gap: '120px' }}>
      {props.showFirst !== false && <Tooltip.Trigger handle={props.detached ? handle : undefined} id="first" payload={1} delay={0}>Trigger 1</Tooltip.Trigger>}
      <Tooltip.Trigger handle={props.detached ? handle : undefined} id="second" payload={2} delay={0} disabled={props.disabledSecond}
        render={host => <button {...host} id={props.customId ? 'custom-button' : host.id} disabled={props.renderedDisabled} />}>Trigger 2</Tooltip.Trigger>
      <Tooltip.Trigger handle={props.detached ? handle : undefined} id="third" payload={3} delay={0}>Trigger 3</Tooltip.Trigger>
    </div>;
  }
  return <div style={{ padding: '50px' }}>
    {props.detached && <Triggers />}
    <Tooltip.Root<number> {...props.root} handle={handle}>{state => <>
      {!props.detached && <Triggers />}
      <Tooltip.Portal><Tooltip.Positioner side="bottom" align="start" data-testid="multi-positioner">
        <Tooltip.Popup data-testid="multi-popup">{props.viewport ? <Tooltip.Viewport><span data-testid="multi-content">{state.payload}</span></Tooltip.Viewport>
          : <span data-testid="multi-content">{state.payload}</span>}</Tooltip.Popup>
      </Tooltip.Positioner></Tooltip.Portal>
    </>}</Tooltip.Root>
  </div>;
}

function Morph(props: { payload?: string; positions?: readonly (readonly [number, number])[] }) {
  return <><style>{`
    [data-transitioning] [data-current] { animation: tooltip-in 10s linear; }
    [data-transitioning] [data-previous] { animation: tooltip-out 10s linear; }
    @keyframes tooltip-in { from { transform: translateX(30%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes tooltip-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-30%); opacity: 0; } }
  `}</style><Tooltip.Root<string>>{state => <>
    {[1, 2, 3].map((number, index) => <Tooltip.Trigger delay={0} payload={number === 2 ? props.payload ?? '2' : String(number)}
      style={{ position: 'fixed', left: `${props.positions?.[index]?.[0] ?? index * 120 + 10}px`, top: `${props.positions?.[index]?.[1] ?? 100}px`, width: '100px', height: '50px' }}>Trigger {number}</Tooltip.Trigger>)}
    <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="popup"><Tooltip.Viewport data-testid="viewport">Content {state.payload}</Tooltip.Viewport></Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
  </>}</Tooltip.Root></>;
}
