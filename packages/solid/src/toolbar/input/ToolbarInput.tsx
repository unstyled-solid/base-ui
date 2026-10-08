import { omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { CompositeItem } from '../../internals/composite';
import { createFocusableWhenDisabled } from '../../utils/createFocusableWhenDisabled';
import type { ToolbarRootItemMetadata, ToolbarRootState } from '../root/ToolbarRoot';
import { useToolbarRootContext } from '../root/ToolbarRootContext';
import { useToolbarGroupContext } from '../group/ToolbarGroupContext';

/** Native editing semantics are retained by the shared composite navigation engine. */
export function ToolbarInput(componentProps: ToolbarInputProps) {
  const root = useToolbarRootContext();
  const group = useToolbarGroupContext();
  const elementProps = omit(componentProps, 'disabled', 'focusableWhenDisabled', 'class', 'render', 'style', 'ref');
  const metadata: ToolbarRootItemMetadata = {
    get disabled() { return root.disabled || (group?.disabled ?? false) || (componentProps.disabled ?? false); },
    get focusableWhenDisabled() { return componentProps.focusableWhenDisabled ?? true; },
  };
  const focusable = createFocusableWhenDisabled({
    composite: true,
    isNativeButton: false,
    get disabled() { return metadata.disabled; },
    get focusableWhenDisabled() { return metadata.focusableWhenDisabled; },
  });
  const state: ToolbarInputState = {
    get disabled() { return metadata.disabled; },
    get orientation() { return root.orientation; },
    get focusable() { return metadata.focusableWhenDisabled; },
  };
  const preventWhenDisabled = (event: Event) => {
    if (metadata.disabled) event.preventDefault();
  };
  return <CompositeItem<ToolbarRootItemMetadata, ToolbarInputState>
    tag="input"
    render={componentProps.render}
    class={componentProps.class}
    style={componentProps.style}
    metadata={metadata}
    state={state}
    refs={[componentProps.ref]}
    props={[{ onClick: preventWhenDisabled, onPointerDown: preventWhenDisabled }, elementProps, focusable.props]}
  />;
}
export interface ToolbarInputState extends ToolbarRootState {
  focusable: boolean;
}
export interface ToolbarInputProps extends BaseUIComponentProps<'input', ToolbarInputState> {
  disabled?: boolean;
  /** Keep disabled inputs in roving focus. @default true */
  focusableWhenDisabled?: boolean;
  defaultValue?: ComponentProps<'input'>['defaultValue'];
}
export namespace ToolbarInput {
  export type State = ToolbarInputState;
  export type Props = ToolbarInputProps;
}
