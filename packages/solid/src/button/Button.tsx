import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createButton } from '../internals/use-button/useButton';
import { createRenderElement } from '../internals/createRenderElement';
import type { BaseUIComponentProps, NativeButtonProps } from '../internals/types';

/** A button that triggers actions. Renders a native `<button>` by default. */
export function Button(componentProps: Button.Props): JSX.Element {
  const { getButtonProps, buttonRef } = createButton({
    get disabled() { return componentProps.disabled ?? false; },
    get focusableWhenDisabled() { return componentProps.focusableWhenDisabled ?? false; },
    get native() { return componentProps.nativeButton ?? true; },
  });
  const state: Button.State = {
    get disabled() { return componentProps.disabled ?? false; },
  };
  // Keep children lazy and getter receivers on the original props. A rest-copy
  // memo would recreate owned JSX children whenever any copied prop changes.
  const elementProps = omit(componentProps, (key) =>
    key === 'render' || key === 'class' || key === 'style' || key === 'ref' ||
    key === 'disabled' || key === 'focusableWhenDisabled' || key === 'nativeButton');

  return createRenderElement('button', componentProps, {
    state,
    get ref() { return [componentProps.ref, buttonRef]; },
    props: [elementProps, getButtonProps],
  });
}

export interface ButtonState {
  /** Whether the button should ignore user interaction. */
  disabled: boolean;
}

export interface ButtonProps
  extends NativeButtonProps, Omit<BaseUIComponentProps<'button', ButtonState,
    Omit<JSX.HTMLAttributes<HTMLElement>, 'ref'> & { ref?: (element: HTMLElement) => void }
  >, 'ref' | 'disabled'> {
  /** Whether the button should ignore user interaction. @default false */
  disabled?: boolean | undefined;
  /** The rendered host, including non-native hosts supplied through `render`. */
  ref?: JSX.Ref<HTMLElement>;
  /** Whether the button remains focusable when disabled. @default false */
  focusableWhenDisabled?: boolean | undefined;
}

export namespace Button {
  export type State = ButtonState;
  export type Props = ButtonProps;
}
