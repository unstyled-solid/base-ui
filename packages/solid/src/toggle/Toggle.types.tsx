import type { JSX } from '@solidjs/web';
import { Toggle, ToggleDataAttributes } from './index';
import type { ToggleChangeEventDetails, ToggleProps } from './index';

// Public source API with Solid-native events, refs and render callbacks.
export const props: ToggleProps<'one' | 'two'> = {
  value: 'one', pressed: false, defaultPressed: true, disabled: false, nativeButton: true,
  form: 'ignored-form', type: 'submit',
  ref: (node: HTMLButtonElement) => { node.focus(); },
  onClick: (event) => {
    const button: HTMLButtonElement = event.currentTarget;
    button.focus();
    event.preventBaseUIHandler();
  },
  onPressedChange: (pressed, details) => {
    const next: boolean = pressed;
    const reason: 'none' = details.reason;
    const event: Event = details.event;
    const alias: Toggle.ChangeEventDetails = details;
    const exported: ToggleChangeEventDetails = alias;
    if (next && reason === 'none' && event.type === 'click') exported.cancel();
  },
  class: (state) => ({ pressed: state.pressed, disabled: state.disabled }),
  render: (host, state) => <button {...host as JSX.ButtonHTMLAttributes<HTMLButtonElement>} data-live={String(state.pressed)} />,
};
export const fixture = () => <Toggle {...props} />;
export const attribute: 'data-pressed' = ToggleDataAttributes.pressed;

// @ts-expect-error Explicit value generic excludes unrelated values.
export const wrongValue: Toggle.Props<'one'> = { value: 'two' };
// @ts-expect-error Pressed proposals are booleans.
export const wrongCallback: Toggle.Props = { onPressedChange: (pressed: string) => pressed };
// @ts-expect-error The pinned Toggle change reason is only none.
export const wrongReason: Toggle.ChangeEventReason = 'trigger-press';
// @ts-expect-error Solid render is a callback, not a cloneable JSX instance.
export const wrongRender: Toggle.Props = { render: <button /> };
