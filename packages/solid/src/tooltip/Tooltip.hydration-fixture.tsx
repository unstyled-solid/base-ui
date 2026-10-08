import { createMemo, createSignal, Loading } from 'solid-js';
import { Tooltip } from './index';

/** Final hydration runner compiles this file separately for server and client.
 * The promise gate is host-owned and deliberately outside Tooltip's engine.
 */
export function TooltipHydrationFixture(props: {
  handle: Tooltip.Handle<string>;
  gate?: Promise<void>;
  changed?: Tooltip.Root.Props<string>['onOpenChange'];
}) {
  const [triggerId, setTriggerId] = createSignal('trigger-a');
  function DelayedTrigger() {
    const ready = createMemo(async () => { await props.gate; return true; });
    return <>{ready() && <Tooltip.Trigger handle={props.handle} id="trigger-b" payload="B">Trigger B</Tooltip.Trigger>}</>;
  }
  return <>
    <button onClick={() => setTriggerId('trigger-b')}>Switch to B</button>
    <Tooltip.Root handle={props.handle} defaultOpen triggerId={triggerId()} onOpenChange={props.changed}>
      {state => <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="popup">{state.payload}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>}
    </Tooltip.Root>
    {triggerId() === 'trigger-a' && <Tooltip.Trigger handle={props.handle} id="trigger-a" payload="A">Trigger A</Tooltip.Trigger>}
    <Loading fallback="Loading"><DelayedTrigger /></Loading>
  </>;
}
