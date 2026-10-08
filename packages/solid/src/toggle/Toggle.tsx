import { createEffect, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createControlled } from '../utils/createControlled';
import { error } from '../utils/error';
import { createBaseUiId } from '../internals/createBaseUiId';
import { createRenderElement } from '../internals/createRenderElement';
import { createButton } from '../internals/use-button/useButton';
import { CompositeItem } from '../internals/composite';
import {
  createChangeEventDetails,
  type BaseUIChangeEventDetails,
} from '../internals/createBaseUIEventDetails';
import { REASONS } from '../internals/reasons';
import type { BaseUIComponentProps } from '../internals/types';
import { useToggleGroupContext } from '../toggle-group/ToggleGroupContext';

/** A two-state button that can be on or off. Renders a `<button>` element. */
export function Toggle<Value extends string = string>(componentProps: ToggleProps<Value>): JSX.Element {
  const elementProps = omit(
    componentProps,
    'class',
    'style',
    'render',
    'ref',
    'defaultPressed',
    'disabled',
    'form',
    'onPressedChange',
    'pressed',
    'type',
    'value',
    'nativeButton',
  );
  // Empty string has the same generated-ID fallback as an omitted value.
  const value = createBaseUiId(() => componentProps.value || undefined);
  const group = useToggleGroupContext<string>();
  const disabled = () => Boolean(componentProps.disabled || group?.disabled);

  if (process.env.NODE_ENV !== 'production') {
    createEffect(
      () => Boolean(group && componentProps.value === undefined && group.isValueInitialized),
      (missingValue) => {
        if (missingValue) {
          error(
            'A `<Toggle>` component rendered in a `<ToggleGroup>` has no explicit `value` prop.',
            'This will cause issues between the Toggle Group and Toggle values.',
            'Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type.',
          );
        }
      },
    );
  }

  const pressed = createControlled<boolean, ToggleChangeEventDetails>({
    value: () => (group ? group.value.includes(value()) : componentProps.pressed),
    // createControlled snapshots the initial default and observes later changes
    // for the source-defined uncontrolled-default diagnostic.
    get defaultValue() {
      return componentProps.defaultPressed ?? false;
    },
    name: 'Toggle',
    state: 'pressed',
    onChange: () => (nextPressed, details) => {
      componentProps.onPressedChange?.(nextPressed, details);
      if (details.isCanceled) {
        return;
      }
      group?.setGroupValue(value(), nextPressed, details);
      // createControlled checks the same details again before staging local state.
    },
  });
  const { getButtonProps, buttonRef } = createButton({
    get disabled() {
      return disabled();
    },
    get native() {
      return componentProps.nativeButton ?? true;
    },
  });
  const state: ToggleState = {
    get disabled() {
      return disabled();
    },
    get pressed() {
      return pressed.value();
    },
  };
  const props = [
    {
      get 'aria-pressed'() {
        return pressed.value();
      },
      onClick(event: MouseEvent) {
        pressed.request(!pressed.value(), createChangeEventDetails(REASONS.none, event));
      },
    },
    elementProps,
    getButtonProps,
  ];
  const metadata = {
    get disabled() {
      return disabled();
    },
    focusableWhenDisabled: false,
  };

  if (group) {
    return (
      <CompositeItem
        tag="button"
        render={componentProps.render}
        class={componentProps.class}
        style={componentProps.style}
        metadata={metadata}
        state={state}
        refs={[buttonRef, componentProps.ref]}
        props={props}
      />
    );
  }
  return createRenderElement('button', componentProps, {
    state,
    get ref() {
      return [buttonRef, componentProps.ref];
    },
    props,
  });
}

export interface ToggleState {
  /** Whether the toggle is currently pressed. */
  pressed: boolean;
  /** Whether the toggle should ignore user interaction. */
  disabled: boolean;
}

export interface ToggleProps<Value extends string = string>
  extends BaseUIComponentProps<'button', ToggleState, JSX.HTMLAttributes<HTMLElement>> {
  /** Controlled pressed state. */
  pressed?: boolean | undefined;
  /** Initial uncontrolled pressed state. @default false */
  defaultPressed?: boolean | undefined;
  /** Whether the component should ignore interaction. @default false */
  disabled?: boolean | undefined;
  /** Whether the render callback returns a native button. @default true */
  nativeButton?: boolean | undefined;
  /** Called before a grouped toggle requests a group value change. */
  onPressedChange?: ((pressed: boolean, eventDetails: ToggleChangeEventDetails) => void) | undefined;
  /** Unique group value; omitted and empty values receive a generated ID. */
  value?: Value | undefined;
}

export type ToggleChangeEventReason = typeof REASONS.none;
export type ToggleChangeEventDetails = BaseUIChangeEventDetails<ToggleChangeEventReason>;

export namespace Toggle {
  export type State = ToggleState;
  export type Props<Value extends string = string> = ToggleProps<Value>;
  export type ChangeEventReason = ToggleChangeEventReason;
  export type ChangeEventDetails = ToggleChangeEventDetails;
}
