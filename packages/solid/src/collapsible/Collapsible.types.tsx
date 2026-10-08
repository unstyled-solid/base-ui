import { Collapsible } from './index';
import type {
  CollapsibleRootProps, CollapsibleRootState, CollapsibleRootChangeEventDetails,
  CollapsibleRootChangeEventReason, CollapsibleTriggerProps, CollapsibleTriggerState,
  CollapsiblePanelProps, CollapsiblePanelState,
} from './index';

// Pinned CollapsibleRoot.spec.tsx namespace/consumer assertions, adapted to native JSX.
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
export type NamespaceParity = [
  Assert<Equal<Collapsible.Root.Props, CollapsibleRootProps>>,
  Assert<Equal<Collapsible.Root.State, CollapsibleRootState>>,
  Assert<Equal<Collapsible.Root.ChangeEventDetails, CollapsibleRootChangeEventDetails>>,
  Assert<Equal<Collapsible.Root.ChangeEventReason, CollapsibleRootChangeEventReason>>,
  Assert<Equal<Collapsible.Trigger.Props, CollapsibleTriggerProps>>,
  Assert<Equal<Collapsible.Trigger.State, CollapsibleTriggerState>>,
  Assert<Equal<Collapsible.Panel.Props, CollapsiblePanelProps>>,
  Assert<Equal<Collapsible.Panel.State, CollapsiblePanelState>>,
];

export const NativeConsumer = () => <Collapsible.Root onOpenChange={(open, details) => {
  const next: boolean = open;
  const reason: 'none' | 'trigger-press' = details.reason;
  const event: Event = details.event;
  if (next && reason === 'none' && event.type === 'beforematch') details.cancel();
}}>
  <Collapsible.Trigger ref={[(node: HTMLButtonElement | null) => { void node; }]} onClick={(event) => {
    const button: HTMLButtonElement = event.currentTarget;
    button.focus();
    event.preventBaseUIHandler();
  }} nativeButton={false} render={(props, state) => <span {...props} class={state.open ? 'open' : 'closed'} />} />
  <Collapsible.Panel hiddenUntilFound style={(state) => ({ opacity: state.open ? 1 : 0.5 })} />
</Collapsible.Root>;

// @ts-expect-error Source disclosure reasons exclude popup-only escape-key.
export const InvalidReason: CollapsibleRootChangeEventReason = 'escape-key';
