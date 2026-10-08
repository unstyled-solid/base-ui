import type { JSX } from '@solidjs/web';
import { Button, ButtonDataAttributes, type ButtonProps, type ButtonState } from './index';

const state: Button.State = { disabled: false } satisfies ButtonState;
const props: Button.Props = { disabled: true, focusableWhenDisabled: true } satisfies ButtonProps;
const disabledAttribute: 'data-disabled' = ButtonDataAttributes.disabled;
void [state, props, disabledAttribute];

export function ButtonTypeFixture() {
  let host!: HTMLElement;
  const ref: JSX.Ref<HTMLElement> = (node) => { host = node; };
  return <>
    <Button {...props} ref={[ref]} type="submit" name="action" value="save"
      class={(value) => ['button', { disabled: value.disabled }]}
      style={(value) => ({ opacity: value.disabled ? 0.5 : 1 })}
      onClick={(event) => {
        const target: HTMLButtonElement = event.currentTarget;
        const native: MouseEvent = event;
        event.preventBaseUIHandler();
        void [target, native, host];
      }} />
    <Button nativeButton={false} render={(renderProps, value) =>
      <a {...renderProps} href="#target" aria-busy={value.disabled ? 'true' : 'false'} />} />
    <Button class={['button', { selected: true }]} />
    {/* @ts-expect-error invalid native button type */}
    <Button type="link" />
    {/* @ts-expect-error component disabled state is boolean, not an attribute string */}
    <Button disabled="" />
    {/* @ts-expect-error state disabled is a boolean */}
    <Button class={(value) => value.disabled.toUpperCase()} />
    {/* @ts-expect-error render is a callback, not a pre-created element */}
    <Button render={<span />} />
    {/* @ts-expect-error native Solid refs do not accept React ref objects */}
    <Button ref={{ current: null }} />
  </>;
}
