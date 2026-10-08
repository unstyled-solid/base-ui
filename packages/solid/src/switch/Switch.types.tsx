import { Switch } from './index';
import type { SwitchRootProps, SwitchRootChangeEventDetails, SwitchThumbState } from './index';
import type { JSX } from '@solidjs/web';
const props: SwitchRootProps = {
  defaultChecked: true, nativeButton: false, name: 'setting', value: 'yes', uncheckedValue: 'no',
  onCheckedChange(value, details) {
    const checked: boolean = value;
    const event: SwitchRootChangeEventDetails = details;
    event.cancel();
    void checked;
  },
};
export const switchTypeFixture = <Switch.Root {...props} class={(state) => ({ checked: state.checked })}>
  <Switch.Thumb class={(state: SwitchThumbState) => state.disabled ? 'disabled' : ''} />
</Switch.Root>;
// @ts-expect-error checked is boolean, not a checkbox indeterminate state
export const invalidChecked = <Switch.Root checked="mixed" />;
// @ts-expect-error a render callback is required, not a pre-created element
export const invalidRender = <Switch.Root render={<span />} />;

const inputRef: JSX.Ref<HTMLInputElement> = (input) => {
  const nativeInput: HTMLInputElement = input;
  void nativeInput;
};
export const nativeEventsAndState = <Switch.Root inputRef={[inputRef]} class={['static', { active: true }]}
  style={(state) => state.checked ? 'color: red' : { color: 'blue' }}
  onClick={(event) => {
    const root: HTMLElement = event.currentTarget;
    const click: MouseEvent = event;
    event.preventBaseUIHandler();
    void root; void click;
  }}
  render={(props, state) => <span {...props} data-current={state.checked} />}
  onCheckedChange={(_, details) => {
    const reason: 'none' = details.reason;
    const event: Event = details.event;
    details.cancel();
    void reason; void event;
  }} />;
// @ts-expect-error the change API is onCheckedChange, not native onChange
export const invalidNativeChange = <Switch.Root onChange={() => {}} />;
// @ts-expect-error inputRef must refer to the checkbox, not a button
export const invalidInputRef = <Switch.Root inputRef={(button: HTMLButtonElement) => { void button; }} />;
