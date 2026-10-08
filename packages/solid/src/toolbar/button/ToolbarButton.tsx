import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createButton } from '../../internals/use-button';
import { CompositeItem } from '../../internals/composite';
import type { ToolbarRootItemMetadata, ToolbarRootState } from '../root/ToolbarRoot';
import { useToolbarRootContext } from '../root/ToolbarRootContext';
import { useToolbarGroupContext } from '../group/ToolbarGroupContext';

/** A toolbar button, also composable with another control's render callback. */
export function ToolbarButton(componentProps: ToolbarButtonProps) {
  const root = useToolbarRootContext();
  const group = useToolbarGroupContext();
  const elementProps = omit(componentProps, 'disabled', 'focusableWhenDisabled', 'nativeButton', 'class', 'render', 'style', 'ref');
  const metadata: ToolbarRootItemMetadata = {
    get disabled() { return root.disabled || (group?.disabled ?? false) || (componentProps.disabled ?? false); },
    get focusableWhenDisabled() { return componentProps.focusableWhenDisabled ?? true; },
  };
  const button = createButton({
    get disabled() { return metadata.disabled; },
    get focusableWhenDisabled() { return metadata.focusableWhenDisabled; },
    get native() { return componentProps.nativeButton; },
  });
  const state: ToolbarButtonState = {
    get disabled() { return metadata.disabled; },
    get orientation() { return root.orientation; },
    get focusable() { return metadata.focusableWhenDisabled; },
  };
  const renderProps = {
    get disabled() { return metadata.disabled; },
  };
  return <CompositeItem<ToolbarRootItemMetadata, ToolbarButtonState>
    tag="button"
    render={componentProps.render}
    class={componentProps.class}
    style={componentProps.style}
    metadata={metadata}
    state={state}
    refs={[componentProps.ref, button.buttonRef]}
    props={[elementProps, componentProps.render ? renderProps : {}, button.getButtonProps]}
  />;
}
export interface ToolbarButtonState extends ToolbarRootState {
  focusable: boolean;
}
export interface ToolbarButtonProps extends BaseUIComponentProps<'button', ToolbarButtonState> {
  /** Whether the rendered element is a native button. @default true */
  nativeButton?: boolean;
  disabled?: boolean;
  /** Keep disabled buttons in roving focus. @default true */
  focusableWhenDisabled?: boolean;
}
export namespace ToolbarButton {
  export type State = ToolbarButtonState;
  export type Props = ToolbarButtonProps;
}
