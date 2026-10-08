import { omit } from 'solid-js';
import type { BaseUIComponentProps, Orientation } from '../internals/types';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails';
import type { REASONS } from '../internals/reasons';
import { createControlled } from '../utils/createControlled';
import { createRenderElement } from '../internals/createRenderElement';
import { CompositeRoot } from '../internals/composite/root/CompositeRoot';
import { useToolbarRootContext } from '../toolbar/root/ToolbarRootContext';
import { useToolbarGroupContext } from '../toolbar/group/ToolbarGroupContext';
import { ToggleGroupContext } from './ToggleGroupContext';

/** Provides shared selection and keyboard navigation to toggle buttons. */
export function ToggleGroup<Value extends string>(componentProps: ToggleGroupProps<Value>) {
  const local = componentProps;
  const elementProps = omit(componentProps,
    'value', 'defaultValue', 'disabled', 'multiple', 'orientation', 'loopFocus',
    'onValueChange', 'class', 'style', 'render', 'ref',
  );
  const toolbar = useToolbarRootContext(true);
  const toolbarGroup = useToolbarGroupContext();
  const emptyValue: readonly Value[] = [];
  const selection = createControlled<readonly Value[], ToggleGroupChangeEventDetails>({
    value: () => local.value,
    // createControlled owns the initial snapshot; keep the input live for its
    // source default-value diagnostics without reinitializing the selection.
    get defaultValue() { return local.defaultValue ?? emptyValue; },
    onChange: () => (next, details) => local.onValueChange?.(next as Value[], details),
    name: 'ToggleGroup',
    state: 'value',
  });
  const state: ToggleGroupState = {
    get disabled() { return (toolbar?.disabled ?? false) || (toolbarGroup?.disabled ?? false) || (local.disabled ?? false); },
    get multiple() { return local.multiple ?? false; },
    get orientation() { return local.orientation ?? 'horizontal'; },
  };
  const context: ToggleGroupContext<Value> = {
    get value() { return selection.value(); },
    get disabled() { return state.disabled; },
    get isValueInitialized() { return local.value !== undefined || local.defaultValue !== undefined; },
    setGroupValue(value, nextPressed, details) {
      let next: Value[];
      if (state.multiple) {
        const current = selection.value();
        next = current.slice();
        if (nextPressed) next.push(value);
        else next.splice(current.indexOf(value), 1);
      } else {
        next = nextPressed ? [value] : [];
      }
      // Carry the resolved candidate through the transaction; staged reads remain old.
      selection.request(next, details);
    },
  };
  const props = [{ role: 'group' }, elementProps];
  return (
    <ToggleGroupContext value={context as ToggleGroupContext}>
      {toolbar ? createRenderElement('div', componentProps, {
        state,
        get ref() { return local.ref; },
        props,
      }) : <CompositeRoot
        render={local.render}
        class={local.class}
        style={local.style}
        state={state}
        refs={[local.ref]}
        props={props}
        loopFocus={local.loopFocus ?? true}
        enableHomeAndEndKeys
        orientation={state.orientation}
      />}
    </ToggleGroupContext>
  );
}

export interface ToggleGroupState {
  disabled: boolean;
  multiple: boolean;
  orientation: Orientation;
}
export interface ToggleGroupProps<Value extends string = string> extends BaseUIComponentProps<'div', ToggleGroupState> {
  value?: readonly Value[] | undefined;
  defaultValue?: readonly Value[] | undefined;
  onValueChange?: ((value: Value[], details: ToggleGroupChangeEventDetails) => void) | undefined;
  disabled?: boolean | undefined;
  orientation?: Orientation | undefined;
  loopFocus?: boolean | undefined;
  multiple?: boolean | undefined;
}
export type ToggleGroupChangeEventReason = typeof REASONS.none;
export type ToggleGroupChangeEventDetails = BaseUIChangeEventDetails<ToggleGroupChangeEventReason>;
export namespace ToggleGroup {
  export type State = ToggleGroupState;
  export type Props<Value extends string = string> = ToggleGroupProps<Value>;
  export type ChangeEventReason = ToggleGroupChangeEventReason;
  export type ChangeEventDetails = ToggleGroupChangeEventDetails;
}
