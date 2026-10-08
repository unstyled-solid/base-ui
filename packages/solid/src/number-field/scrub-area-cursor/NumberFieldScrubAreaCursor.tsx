import { omit } from 'solid-js';
import { Portal, isServer } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { platform } from '../../utils/platform';
import { ownerDocument } from '../../utils/owner';
import { useNumberFieldRootContext } from '../root/NumberFieldRootContext';
import type { NumberFieldRootState } from '../root/NumberFieldRoot';
import { useNumberFieldScrubAreaContext } from '../scrub-area/NumberFieldScrubAreaContext';
import { stateAttributesMapping } from '../utils/stateAttributesMapping';

export function NumberFieldScrubAreaCursor(props: NumberFieldScrubAreaCursor.Props) {
  const elementProps = omit(props, 'render', 'class', 'style', 'ref');
  const root = useNumberFieldRootContext();
  const area = useNumberFieldScrubAreaContext();
  if (isServer) return null;
  const enabled = () => area.isScrubbing && !platform.engine.webkit && !area.isTouchInput && !area.isPointerLockDenied;
  return <Portal mount={ownerDocument(area.element).body}>
    {createRenderElement('span', props, {
      get enabled() { return enabled(); }, state: root.state,
      get ref() { return [props.ref, area.registerCursor]; },
      props: [{ role: 'presentation', style: { position: 'fixed', top: '0', left: '0', 'pointer-events': 'none' } }, elementProps],
      stateAttributesMapping,
    })}
  </Portal>;
}
export interface NumberFieldScrubAreaCursorState extends NumberFieldRootState {}
export interface NumberFieldScrubAreaCursorProps extends BaseUIComponentProps<'span', NumberFieldScrubAreaCursorState> {}
export namespace NumberFieldScrubAreaCursor { export type Props = NumberFieldScrubAreaCursorProps; export type State = NumberFieldScrubAreaCursorState; }
