import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { ToolbarRootState } from '../root/ToolbarRoot';
import { useToolbarRootContext } from '../root/ToolbarRootContext';
import { ToolbarGroupContext } from './ToolbarGroupContext';

/** Groups toolbar controls; the nearest group supplies their disabled state. */
export function ToolbarGroup(componentProps: ToolbarGroupProps) {
  const root = useToolbarRootContext();
  const elementProps = omit(componentProps, 'disabled', 'class', 'render', 'style', 'ref');
  const context: ToolbarGroupContext = {
    get disabled() { return root.disabled || (componentProps.disabled ?? false); },
  };
  const state: ToolbarGroupState = {
    get disabled() { return context.disabled; },
    get orientation() { return root.orientation; },
  };
  return <ToolbarGroupContext value={context}>
    {createRenderElement('div', componentProps, {
      state,
      get ref() { return componentProps.ref; },
      props: [{ role: 'group' }, elementProps],
    })}
  </ToolbarGroupContext>;
}
export interface ToolbarGroupState extends ToolbarRootState {}
export interface ToolbarGroupProps extends BaseUIComponentProps<'div', ToolbarGroupState> {
  /** Disable the controls in this group. @default false */
  disabled?: boolean;
}
export namespace ToolbarGroup {
  export type State = ToolbarGroupState;
  export type Props = ToolbarGroupProps;
}
