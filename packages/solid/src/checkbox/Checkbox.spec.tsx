import type { JSX } from '@solidjs/web';
import { Checkbox, CheckboxRootDataAttributes, CheckboxIndicatorDataAttributes } from './index';
import { CheckboxGroup, CheckboxGroupDataAttributes } from '../checkbox-group';
import type { CheckboxRootProps, CheckboxRootState, CheckboxRootChangeEventDetails } from './index';
import type { CheckboxIndicatorProps, CheckboxIndicatorState } from './index';
import type { CheckboxGroupProps, CheckboxGroupState } from '../checkbox-group';

// Compile-only public consumers. Native render callbacks explicitly select their host type.
export function CheckboxConsumer() {
  const initial = ['one', 'two'] as const;
  const inputRef: JSX.Ref<HTMLInputElement> = (node) => { node.indeterminate = true; };
  return <CheckboxGroup defaultValue={initial} allValues={initial}
    class={(state) => [state.disabled && 'disabled', { touched: state.touched }]}
    onValueChange={(value, details) => {
      value.push('three');
      const event: Event = details.event;
      if (event.defaultPrevented) details.cancel();
    }}>
    <Checkbox.Root parent inputRef={inputRef} nativeButton
      render={(props, state) => <button {...(props as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} data-mixed={state.indeterminate ? '' : undefined} />} />
    <Checkbox.Root value="one" name="items" form="form" uncheckedValue="off" required readOnly
      class={(state) => ({ selected: state.checked, mixed: state.indeterminate })}
      onCheckedChange={(checked, details) => {
        const value: boolean = checked;
        const reason: 'none' = details.reason;
        if (value && reason === 'none') details.cancel();
      }}>
      <Checkbox.Indicator keepMounted class={(state) => [state.transitionStatus, state.checked && 'checked']} />
    </Checkbox.Root>
  </CheckboxGroup>;
}

const rootProps: Checkbox.Root.Props = { checked: false, inputRef: (input) => { input.checked = false; } };
const rootAlias: CheckboxRootProps = rootProps;
const indicatorProps: Checkbox.Indicator.Props = { keepMounted: true };
const indicatorAlias: CheckboxIndicatorProps = indicatorProps;
const groupProps: CheckboxGroup.Props = { value: [''] };
const groupAlias: CheckboxGroupProps = groupProps;
export const typeAliases: [CheckboxRootProps, CheckboxIndicatorProps, CheckboxGroupProps] = [rootAlias, indicatorAlias, groupAlias];
export type PublicStates = CheckboxRootState | CheckboxIndicatorState | CheckboxGroupState;
export type Details = CheckboxRootChangeEventDetails;
export const attributes: [string, string, string] = [CheckboxRootDataAttributes.checked, CheckboxIndicatorDataAttributes.endingStyle, CheckboxGroupDataAttributes.disabled];

// @ts-expect-error Selection is a boolean, not the native input's string value.
export const invalidChecked: CheckboxRootProps = { checked: 'true' };
// @ts-expect-error Group selection requires strings.
export const invalidGroup: CheckboxGroupProps = { value: [1] };
// @ts-expect-error Render is a callback, never a cloneable JSX element.
export const invalidRender: CheckboxRootProps = { render: <span /> };
