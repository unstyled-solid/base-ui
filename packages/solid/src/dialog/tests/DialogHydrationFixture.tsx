import { createMemo, Loading, onSettled } from 'solid-js';
import { Dialog } from '../index';

/** Compile independently for server/client in the hydration lane; only serialized HTML crosses realms. */
export function DialogHydrationFixture(props: {
  rootOpen?: boolean;
  delayTrigger?: Promise<void>;
  onClientReady?: (handle: Dialog.Handle<number>) => void;
}) {
  const handle = Dialog.createHandle<number>();
  onSettled(() => { props.onClientReady?.(handle); });
  function DelayedTrigger() {
    const ready = createMemo(async () => { await props.delayTrigger; return true; });
    return <>{ready() && <Dialog.Trigger handle={handle} id="hydrated-trigger" payload={7}>Hydrated trigger</Dialog.Trigger>}</>;
  }
  return <>
    <Dialog.Root handle={handle} open={props.rootOpen} defaultOpen defaultTriggerId="hydrated-trigger" modal={false}>
      {(context) => <Dialog.Portal><Dialog.Popup><output>{context.payload}</output><Dialog.Close>Close hydrated</Dialog.Close></Dialog.Popup></Dialog.Portal>}
    </Dialog.Root>
    <Loading fallback="Loading trigger"><DelayedTrigger /></Loading>
  </>;
}
