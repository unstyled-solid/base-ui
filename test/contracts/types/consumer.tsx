import type { JSX } from '@solidjs/web';
import { createRenderer } from '../../../packages/solid/test/createRenderer';
import { firePointer, expectType } from '../../../packages/solid/test';
import { describeConformance } from '../../../packages/solid/test/describeConformance';
import type { ConformanceHostProps, ConformanceOptions } from '../../../packages/solid/test/describeConformance';
import type { InputProps, InputState } from 'baseui-solid2/input';
// The source label/link/input conformance fixtures must remain expressible.
const customTags: ConformanceOptions<object, unknown>['testRenderPropWith'][] = ['label', 'a', 'input', 'div'];
void customTags;
const native: JSX.EventHandler<HTMLInputElement, InputEvent> = (event) => {
  expectType<EventTarget & HTMLInputElement, typeof event.currentTarget>(event.currentTarget);
};
const node = <input onInput={native} class={['field', { active: true }]} />;
const { render, renderProps } = createRenderer();
void render(() => node);
void renderProps((props: { label: string }) => <button>{props.label}</button>, { label: 'ok' });
// @ts-expect-error JSX values are not render factories; setup must be owned.
void render(node);
// @ts-expect-error initial host props must match the fixture.
void renderProps((props: { label: string }) => <button>{props.label}</button>, { label: 1 });
// @ts-expect-error deterministic pointer timing is mandatory.
firePointer.down(document.body, { pointerType: 'touch' });

const inputHost: ConformanceHostProps<HTMLInputElement> = {
  onInput: (event) => { event.currentTarget.select(); },
  onClick: [(data: string, event) => { event.currentTarget.value = data; }, 'value'],
};
void inputHost;
const badInputHost: ConformanceHostProps<HTMLInputElement> = {
  // @ts-expect-error Native input handlers cannot require a button currentTarget.
  onClick: (event: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }) => { event.currentTarget.disabled = true; },
};
void badInputHost;
declare function NativeInput(props: InputProps): JSX.Element;
// Genuine branded component callbacks and assigned/native refs retain their own
// types; generated conformance attachment callbacks are a compatible subset.
describeConformance<InputState, InputProps, HTMLInputElement>((props) => <NativeInput {...props} />, {
  initialProps: {}, refInstanceof: HTMLInputElement, testRenderPropWith: 'input',
});
