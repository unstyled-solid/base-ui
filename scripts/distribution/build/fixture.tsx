import { createSignal, onCleanup } from 'solid-js';
import { createComponent, type JSX } from '@solidjs/web';
import { Toggle, Separator, DirectionProvider, mergeProps } from 'baseui-solid2';

// A real production consumer: root barrel, generic declaration props, native
// events, reactive update, live refs, SSR IDs, provider, and setup disposal.
export function PackageFixture(props: { cleanup?: () => void }): JSX.Element {
  const [pressed, setPressed] = createSignal(false);
  onCleanup(() => props.cleanup?.());
  return <DirectionProvider direction="ltr">
    <section id="package-smoke">
      <Toggle<string> id="package-toggle" pressed={pressed()} onPressedChange={setPressed}>Package toggle</Toggle>
      <Separator id="package-separator" orientation="vertical" />
      <output id="package-value">{pressed() ? 'on' : 'off'}</output>
    </section>
  </DirectionProvider>;
}

export const createFixture = (props: { cleanup?: () => void } = {}) => createComponent(PackageFixture, props);

// Independent native-host control proves the backend's hydration contract using
// actual package providers/prop-merging. It does not replace the default-host gate.
export function CompilerFixture(props: { cleanup?: () => void }): JSX.Element {
  const [pressed, setPressed] = createSignal(false);
  onCleanup(() => props.cleanup?.());
  const button = mergeProps<'button'>({ id: 'package-toggle', onClick: () => setPressed(value => !value) }, {
    get 'aria-pressed'() { return pressed() ? 'true' as const : 'false' as const; },
  });
  return <DirectionProvider direction="ltr"><section id="package-smoke">
    <button {...button}>Package toggle</button>
    <div id="package-separator" role="separator" aria-orientation="vertical" />
    <output id="package-value">{pressed() ? 'on' : 'off'}</output>
  </section></DirectionProvider>;
}
export const createCompilerFixture = (props: { cleanup?: () => void } = {}) => createComponent(CompilerFixture, props);
