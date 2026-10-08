import { createEffect, createMemo, omit } from 'solid-js';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { MeterRootState } from '../root/MeterRoot';
import { useMeterRootContext } from '../root/MeterRootContext';

/** An accessible label for the meter. Renders a span. */
export function MeterLabel(props: MeterLabel.Props) {
  const context = useMeterRootContext();
  const baseId = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  // Register only when the resolved ID changes, as upstream's [id] dependency does.
  // An unrelated update through a live prop record must not reclaim another label.
  const id = createMemo(baseId);
  createEffect(id, (nextId) => {
    context.setLabelId(nextId);
    return () => { context.setLabelId((currentId) => currentId === nextId ? undefined : currentId); };
  });
  return createRenderElement('span', props, {
    props: [{ get id() { return id(); }, role: 'presentation' }, omit(props, 'render', 'class', 'style', 'id')],
  });
}
export interface MeterLabelState extends MeterRootState {}
export interface MeterLabelProps extends BaseUIComponentProps<'span', MeterLabelState> {}
export namespace MeterLabel {
  export type State = MeterLabelState;
  export type Props = MeterLabelProps;
}
