import { createSignal, omit } from 'solid-js';
import { FieldsetRootContext, useFieldsetRootContext } from './FieldsetRootContext';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps, HTMLProps } from '../../internals/types';

/** Groups a shared legend with related controls. Renders a `<fieldset>` element. */
export function FieldsetRoot(componentProps: FieldsetRoot.Props) {
  const elementProps = omit(componentProps, 'render', 'class', 'style', 'disabled');
  const parent = useFieldsetRootContext(true);
  const [legendId, setLegendId] = createSignal<string | undefined>(undefined);
  const disabled = () => (parent?.disabled || componentProps.disabled) ?? false;
  const state: FieldsetRootState = { get disabled() { return disabled(); } };
  const context: FieldsetRootContext = {
    get legendId() { return legendId(); },
    get disabled() { return disabled(); },
    setLegendId,
  };

  // Allocate the render helper in component setup, within the provider's owner.
  function RootElement() {
    return createRenderElement('fieldset', componentProps, {
      state,
      props: [{ get 'aria-labelledby'() { return legendId(); }, get disabled() { return disabled(); } }, elementProps],
    });
  }
  return <FieldsetRootContext value={context}><RootElement /></FieldsetRootContext>;
}

export interface FieldsetRootState { disabled: boolean }
export interface FieldsetRootProps extends BaseUIComponentProps<'fieldset', FieldsetRootState, HTMLProps & { disabled?: boolean }> {
  /** Whether this fieldset and its descendants should ignore user interaction. */
  disabled?: boolean;
}
export namespace FieldsetRoot {
  export type State = FieldsetRootState;
  export type Props = FieldsetRootProps;
}
