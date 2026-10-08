import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createLabel, focusElementWithVisible } from '../../internals/labelable-provider/createLabel';
import { useSliderRootContext } from '../root/SliderRootContext';
import { sliderStateAttributesMapping } from '../root/stateAttributesMapping';
import type { SliderRootState } from '../root/SliderRoot';
export function SliderLabel(props: SliderLabelProps) {
  const context = useSliderRootContext();
  const labelProps = createLabel({
    get id() { return context.rootLabelId; }, setLabelId: context.setLabelId,
    focusControl(event, controlId) {
      const registered = controlId ? (event.currentTarget as HTMLElement).ownerDocument.getElementById(controlId) : null;
      const inputs = context.controlRef.current?.querySelectorAll<HTMLInputElement>('input[type="range"]');
      const input = registered ?? (inputs?.length === 1 ? inputs[0] : null);
      if (input) focusElementWithVisible(input);
    },
  });
  return createRenderElement('div', props, { state: context.state, stateAttributesMapping: sliderStateAttributesMapping,
    props: [labelProps, omit(props as SliderLabelProps & { id?: string }, 'class', 'style', 'render', 'id')],
  });
}
export type SliderLabelState = SliderRootState;
export interface SliderLabelProps extends Omit<BaseUIComponentProps<'div', SliderLabelState, JSX.HTMLAttributes<HTMLElement>>, 'id'> {}
export namespace SliderLabel { export type State = SliderLabelState; export type Props = SliderLabelProps }
