import { expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { computePosition, platform, type ElementRects, type Rect } from '@floating-ui/dom';
import { createRenderer, waitFor } from '../../test';
import { createFloatingRoot } from '../floating-ui-react/components/createFloatingRoot';
import { createAnchorPositioning } from './createAnchorPositioning';
vi.mock('@floating-ui/dom', async (original) => {
  const actual = await original<typeof import('@floating-ui/dom')>();
  return { ...actual, computePosition: vi.fn(actual.computePosition) };
});

it('anchor sizing rejects late middleware DOM writes after a positioning-option replacement', async () => {
  let width = 10, releaseOld!: (rect: Rect) => void, firstClip = true;
  const clip = { x: 0, y: 0, width: 1000, height: 1000 };
  const rectangles = vi.spyOn(platform, 'getElementRects').mockImplementation(async (): Promise<ElementRects> => ({ reference: { x: 0, y: 0, width, height: 10 }, floating: { x: 0, y: 0, width: 10, height: 10 } }));
  const dimensions = vi.spyOn(platform, 'getDimensions').mockResolvedValue({ width: 10, height: 10 });
  const clipping = vi.spyOn(platform, 'getClippingRect').mockImplementation(() => {
    if (!firstClip) return clip;
    firstClip = false;
    return new Promise<Rect>((resolve) => { releaseOld = resolve; });
  });
  const computations = vi.mocked(computePosition);
  const trigger = document.createElement('button'); document.body.append(trigger);
  const view = await createRenderer().renderProps((props: { side: 'top' | 'bottom' }) => {
    const [element, setElement] = createSignal<HTMLElement | null>(null);
    const root = createFloatingRoot({ state: { open: true, transitionStatus: undefined, domReferenceElement: trigger, referenceElement: trigger, positionReference: null,
      get floatingElement() { return element(); }, floatingId: 'popup' } });
    const position = createAnchorPositioning({ rootContext: root, mounted: true, disableAnchorTracking: true,
      collisionAvoidance: { side: 'none', align: 'none' }, get side() { return props.side; } });
    return <div data-testid="positioner" ref={setElement} style={position.positionerStyles} data-positioned={String(position.isPositioned)} />;
  }, { side: 'bottom' });
  try {
    // Suspend the old size middleware itself, after its request has started.
    await waitFor(() => expect(clipping).toHaveBeenCalledTimes(1));
    width = 50;
    await view.setProps({ side: 'top' }); expect(rectangles).toHaveBeenCalledTimes(2);
    const node = view.getByTestId('positioner');
    await waitFor(() => expect(node).toHaveAttribute('data-positioned', 'true'));
    expect(node.style.getPropertyValue('--anchor-width')).toBe('50px');
    releaseOld(clip);
    await computations.mock.results[0]!.value;
    expect(node.style.getPropertyValue('--anchor-width')).toBe('50px');
  } finally { view.unmount(); trigger.remove(); rectangles.mockRestore(); dimensions.mockRestore(); clipping.mockRestore(); }
});
