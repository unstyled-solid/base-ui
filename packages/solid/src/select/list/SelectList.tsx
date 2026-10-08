import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useSelectRootContext } from '../root/SelectRootContext';
import { useSelectPositionerContext } from '../positioner/SelectPositionerContext';
import { LIST_FUNCTIONAL_STYLES } from '../popup/utils';
import { styleDisableScrollbar } from '../../utils/styles';
export function SelectList(props: SelectListProps) {
  const model = useSelectRootContext();
  const positioner = useSelectPositionerContext();
  return createRenderElement('div', props, {
    ref: model.setListElement,
    props: [{ get id() { return `${model.id()}-list`; }, role: 'listbox',
      get 'aria-multiselectable'() { return model.multiple || undefined; }, get 'aria-readonly'() { return model.readOnly || undefined; },
      get style() { return positioner.alignItemWithTriggerActive ? LIST_FUNCTIONAL_STYLES : undefined; },
      get class() { return model.arrowCount > 0 && model.openMethod !== 'touch' ? styleDisableScrollbar.className : undefined; },
      onScroll(event: Event) { model.scrollHandler(event.currentTarget as HTMLElement); },
    }, omit(props, 'class', 'style', 'render')],
  });
}
export interface SelectListState {}
export interface SelectListProps extends BaseUIComponentProps<'div', SelectListState> {}
export namespace SelectList { export type Props = SelectListProps; export type State = SelectListState }
