import { createSignal, onCleanup } from 'solid-js';
import { DirectionProvider } from '../direction-provider';
import { Toggle } from '../toggle';
import { Separator } from '../separator';

// Mirrors the production package smoke's dynamic host + text-child graph.
export function RendererHydrationFixture(props: { disposed?: () => void }) {
  const [pressed, setPressed] = createSignal(false);
  onCleanup(() => props.disposed?.());
  return <DirectionProvider direction="ltr"><section>
    <Toggle<string> pressed={pressed()} onPressedChange={setPressed}>Package toggle</Toggle>
    <Separator orientation="vertical" />
    <output>{pressed() ? 'on' : 'off'}</output>
  </section></DirectionProvider>;
}
