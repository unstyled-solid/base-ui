import { createEffect, createSignal, omit, onSettled } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { Side } from '../../internals/createAnchorPositioning';
import { createRenderElement } from '../../internals/createRenderElement';
import { createTransitionStatus, type TransitionStatus } from '../../internals/createTransitionStatus';
import { createAnimationsFinished } from '../../internals/createAnimationsFinished';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import { createTimeout } from '../../utils/createTimeout';
import { getMaxScrollOffset, normalizeScrollOffset } from '../../utils/scrollEdges';
import { useSelectRootContext } from '../root/SelectRootContext';
import { useSelectPositionerContext } from '../positioner/SelectPositionerContext';
import { getTargetScrollTop } from './scrollTarget';
export function SelectScrollArrow(props: SelectScrollArrowProps) {
  const model = useSelectRootContext();
  const positioner = useSelectPositionerContext();
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  const up = () => props.direction === 'up';
  const visible = () => (up() ? model.scrollUp : model.scrollDown) && model.openMethod !== 'touch';
  const transition = createTransitionStatus(visible);
  const timeout = createTimeout();
  onSettled(() => {
    model.setArrowCount(count => count + 1);
    return () => model.setArrowCount(count => Math.max(0, count - 1));
  });
  createEffect(() => ({ element: element(), up: up() }), data => {
    const ref = data.up ? positioner.scrollUpArrow : positioner.scrollDownArrow;
    ref.current = data.element;
    return () => { if (ref.current === data.element) ref.current = null; };
  });
  createAnimationsFinished({ element, enabled: () => !visible(), onFinished() { transition.setMounted(false); } });
  createEffect(() => visible(), value => { if (!value) timeout.clear(); });
  function scroll() {
    const scroller = model.listElement ?? model.popupElement;
    if (!scroller) return;
    model.setActiveIndex(null);
    const max = getMaxScrollOffset(scroller.scrollHeight, scroller.clientHeight);
    const offset = normalizeScrollOffset(scroller.scrollTop, max);
    scroller.scrollTop = offset;
    if (offset === (up() ? 0 : max)) { timeout.clear(); model.updateScroll(scroller); return; }
    if (model.listRef.current.length > 0) scroller.scrollTop = getTargetScrollTop(model.listRef.current, up(), offset, scroller.clientHeight, element()?.offsetHeight ?? 0, max);
    model.scrollHandler(scroller);
    timeout.start(40, scroll);
  }
  return createRenderElement('div', props, {
    get enabled() { return transition.mounted || !!props.keepMounted; }, ref: setElement,
    state: { get direction() { return props.direction; }, get visible() { return visible(); }, get side() { return positioner.side; }, get transitionStatus() { return transition.transitionStatus; } },
    stateAttributesMapping: transitionStatusMapping,
    props: [{ 'aria-hidden': true, get children() { return up() ? '▲' : '▼'; }, style: { position: 'absolute' },
      onMouseMove(event: MouseEvent) {
        if ((event.movementX === 0 && event.movementY === 0) || timeout.isStarted()) return;
        model.setActiveIndex(null); timeout.start(40, scroll);
      }, onMouseLeave() { timeout.clear(); },
    }, omit(props, 'class', 'style', 'render', 'direction', 'keepMounted')],
  });
}
export interface SelectScrollArrowState { direction: 'up' | 'down'; visible: boolean; side: Side | 'none'; transitionStatus: TransitionStatus }
export interface SelectScrollArrowProps extends BaseUIComponentProps<'div', SelectScrollArrowState> { direction: 'up' | 'down'; keepMounted?: boolean }
export namespace SelectScrollArrow { export type Props = SelectScrollArrowProps; export type State = SelectScrollArrowState }
