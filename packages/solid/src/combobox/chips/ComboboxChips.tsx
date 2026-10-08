import { createSignal, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { CompositeList } from '../../internals/composite';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { ComboboxChipsContext } from './ComboboxChipsContext';
import { handleInputPress } from '../utils/handleInputPress';
import { createValueChanged } from '../../internals/createValueChanged';
export interface ComboboxChipsState {}
export interface ComboboxChipsProps extends BaseUIComponentProps<'div', ComboboxChipsState> {}
export function ComboboxChips(props: ComboboxChipsProps) {
  const model = useComboboxRootContext(); const [highlighted, setHighlighted] = createSignal<number>();
  createValueChanged(() => model.state.open, () => { if (model.state.open) setHighlighted(undefined); });
  const context: ComboboxChipsContext = { get highlightedChipIndex() { return model.state.open ? undefined : highlighted(); }, setHighlightedChipIndex: setHighlighted, chipsRef: { current: [] } };
  return <ComboboxChipsContext value={context}><CompositeList elementsRef={context.chipsRef}>
    {createRenderElement('div', props, { get ref() { return [props.ref, model.context.chipsContainerRef]; }, props: [{
      get role() { return model.state.hasSelectionChips ? 'toolbar' : undefined; },
      onMouseDown(event: MouseEvent) { handleInputPress(event, model, model.state.disabled); },
    }, omit(props, 'class', 'style', 'render', 'ref')] })}
  </CompositeList></ComboboxChipsContext>;
}
export namespace ComboboxChips { export type Props = ComboboxChipsProps; export type State = ComboboxChipsState }
