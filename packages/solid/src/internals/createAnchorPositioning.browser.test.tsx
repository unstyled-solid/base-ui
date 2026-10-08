import { expect } from 'vitest';
import { createSignal } from 'solid-js';
import { browserCase, createRenderer, waitFor } from '../../test';
import { createFloatingRoot } from '../floating-ui-react/components/createFloatingRoot';
import { createAnchorPositioning } from './createAnchorPositioning';

for (const lazyFlip of [true, 'placement', false] as const) {
  for (const side of ['right', 'bottom'] as const) {
    browserCase({ source: 'packages/react/src/internals/useAnchorPositioning.test.tsx', case: `lazy flip ${lazyFlip} ${side} preserves source resize behavior`, environment: 'browser', issue: 'bsolid-positioning' }, async () => {
      const view = await createRenderer().renderProps((props: { height: number }) => {
        const [reference, setReference] = createSignal<HTMLElement | null>(null);
        const [floating, setFloating] = createSignal<HTMLElement | null>(null);
        const root = createFloatingRoot({ state: { open: true, transitionStatus: undefined,
          get referenceElement() { return reference(); }, get domReferenceElement() { return reference(); },
          positionReference: null, get floatingElement() { return floating(); }, floatingId: 'lazy' } });
        const position = createAnchorPositioning({ rootContext: root, mounted: true, keepMounted: true,
          positionMethod: 'fixed', side, align: side === 'right' ? 'start' : 'center', lazyFlip,
          collisionAvoidance: { fallbackAxisSide: 'none' } });
        return <><div ref={setReference} data-testid="anchor" style={{ position: 'fixed', right: '200px', bottom: '30px', width: '20px', height: '20px' }} />
          <div ref={setFloating} data-testid="floating" data-side={position.side} data-align={position.align}
            style={{ ...position.positionerStyles, width: '100px', height: `${props.height}px` }} /></>;
      }, { height: 100 });
      const node = view.getByTestId('floating');
      await waitFor(() => expect(node).toHaveAttribute(side === 'right' ? 'data-align' : 'data-side', side === 'right' ? 'end' : 'top'));
      await view.setProps({ height: 10 });
      const expected = side === 'right' ? lazyFlip === 'placement' ? 'end' : 'start' : lazyFlip ? 'top' : 'bottom';
      await waitFor(() => expect(node).toHaveAttribute(side === 'right' ? 'data-align' : 'data-side', expected));
      if (expected === 'end' || expected === 'top') {
        await waitFor(() => expect(Math.abs(node.getBoundingClientRect().bottom - view.getByTestId('anchor').getBoundingClientRect()[expected === 'end' ? 'bottom' : 'top'])).toBeLessThan(1));
      }
    });
  }
}

browserCase({ source: 'packages/react/src/internals/useAnchorPositioning.ts', case: 'keepMounted tracks real ancestor scrolling and anchor resize', environment: 'browser', issue: 'bsolid-positioning' }, async () => {
  const view = await createRenderer().render(() => {
    const [reference, setReference] = createSignal<HTMLElement | null>(null);
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);
    const root = createFloatingRoot({ state: { open: true, transitionStatus: undefined,
      get referenceElement() { return reference(); }, get domReferenceElement() { return reference(); },
      positionReference: null, get floatingElement() { return floating(); }, floatingId: 'tracking' } });
    const position = createAnchorPositioning({ rootContext: root, mounted: true, keepMounted: true,
      positionMethod: 'fixed', side: 'bottom', align: 'start', collisionAvoidance: { side: 'none', align: 'none' } });
    return <><div data-testid="scroller" style={{ position: 'fixed', top: '100px', left: '100px', height: '200px', width: '300px', overflow: 'auto' }}>
      <div style={{ height: '600px', padding: '70px 0 0' }}><div ref={setReference} data-testid="anchor" style={{ width: '80px', height: '30px' }} /></div>
    </div><div ref={setFloating} data-testid="floating" data-positioned={String(position.isPositioned)} style={{ ...position.positionerStyles, width: '60px', height: '20px' }} /></>;
  });
  const node = view.getByTestId('floating'), anchor = view.getByTestId('anchor');
  await waitFor(() => expect(node).toHaveAttribute('data-positioned', 'true'));
  const initialTop = node.getBoundingClientRect().top;
  view.getByTestId('scroller').scrollTop = 40;
  await waitFor(() => expect(node.getBoundingClientRect().top).toBe(initialTop - 40));
  // createFloating projects coordinates to device pixels, as react-dom does.
  expect(node.getBoundingClientRect().top).toBe(Math.round(anchor.getBoundingClientRect().bottom * devicePixelRatio) / devicePixelRatio);
  anchor.style.height = '55px';
  await waitFor(() => expect(node.getBoundingClientRect().top).toBe(initialTop - 15));
  expect(node.style.getPropertyValue('--anchor-height')).toBe('55px');
});

browserCase({ source: 'packages/react/src/internals/useAnchorPositioning.ts', case: 'retained hidden middleware projects configured origin without size or readiness', environment: 'browser', issue: 'bsolid-lnjy' }, async () => {
  const view = await createRenderer().renderProps((props: { mounted: boolean; side: 'top' | 'bottom' }) => {
    const [reference, setReference] = createSignal<HTMLElement | null>(null);
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);
    const root = createFloatingRoot({ state: {
      get open() { return props.mounted; }, transitionStatus: undefined,
      get referenceElement() { return reference(); }, get domReferenceElement() { return reference(); },
      positionReference: null, get floatingElement() { return floating(); }, floatingId: 'retained',
    } });
    const position = createAnchorPositioning({ rootContext: root, keepMounted: true,
      get mounted() { return props.mounted; }, get side() { return props.side; }, sideOffset: 7,
      collisionAvoidance: { side: 'none', align: 'none' },
    });
    return <><button ref={setReference}>Anchor</button><div ref={setFloating} data-testid="positioner"
      hidden={!props.mounted} data-positioned={String(position.isPositioned)} style={position.positionerStyles} /></>;
  }, { mounted: false, side: 'bottom' });
  const node = view.getByTestId('positioner');
  await waitFor(() => expect(node.style.getPropertyValue('--transform-origin')).toBe('0px -7px'));
  expect(node).toHaveAttribute('data-positioned', 'false');
  expect(node.style.opacity).toBe('0');
  expect(node.style.position).toBe('fixed');
  expect(node.style.getPropertyValue('--available-width')).toBe('100vw');
  expect(node.style.getPropertyValue('--available-height')).toBe('100vh');
  expect(node.style.getPropertyValue('--anchor-width')).toBe('');
  await view.setProps({ side: 'top' });
  await waitFor(() => expect(node.style.getPropertyValue('--transform-origin')).toBe('0px calc(100% + 7px)'));
  expect(node).toHaveAttribute('data-positioned', 'false');
  await view.setProps({ mounted: true });
  await waitFor(() => expect(node).toHaveAttribute('data-positioned', 'true'));
  expect(node.style.position).toBe('absolute');
  expect(node.style.getPropertyValue('--anchor-width')).not.toBe('');
  const openOrigin = node.style.getPropertyValue('--transform-origin');
  await view.setProps({ mounted: false });
  expect(node).toHaveAttribute('data-positioned', 'false');
  expect(node).toHaveAttribute('hidden');
  expect(node.style.position).toBe('fixed');
  expect(node.style.opacity).toBe('0');
  expect(node.style.transform).toBe('');
  expect(node.style.getPropertyValue('--transform-origin')).toBe(openOrigin);
});

browserCase({ source: 'packages/react/src/internals/useAnchorPositioning.ts', case: 'retained exit stays positioned until unmounted and preserves measured origin on close', environment: 'browser', issue: 'bsolid-positioning' }, async () => {
  const view = await createRenderer().renderProps((props: { mounted: boolean; open: boolean }) => {
    const [reference, setReference] = createSignal<HTMLElement | null>(null);
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);
    const root = createFloatingRoot({ state: { get open() { return props.open; }, transitionStatus: undefined,
      get referenceElement() { return reference(); }, get domReferenceElement() { return reference(); },
      positionReference: null, get floatingElement() { return floating(); }, floatingId: 'exit' } });
    const position = createAnchorPositioning({ rootContext: root, keepMounted: true,
      get mounted() { return props.mounted; }, get open() { return props.open; },
      collisionAvoidance: { side: 'none', align: 'none' } });
    return <><div ref={setReference} style={{ position: 'fixed', top: '100px', left: '100px', width: '80px', height: '20px' }} />
      <div ref={setFloating} data-testid="floating" hidden={!props.mounted} data-positioned={String(position.isPositioned)}
        style={{ ...position.positionerStyles, width: '100px', height: '20px' }} /></>;
  }, { mounted: true, open: true });
  const node = view.getByTestId('floating');
  await waitFor(() => expect(node).toHaveAttribute('data-positioned', 'true'));
  await waitFor(() => expect(node.style.getPropertyValue('--transform-origin')).toBe('50px 0px'));
  await view.setProps({ open: false });
  expect(node).toHaveAttribute('data-positioned', 'true');
  await view.setProps({ mounted: false });
  expect(node).toHaveAttribute('data-positioned', 'false');
  expect(node.style.getPropertyValue('--transform-origin')).toBe('50px 0px');
});
