import type { JSX } from '@solidjs/web';
import type { Tabs } from '../index';

// Strict public consumer checks, including the intentionally unrestricted
// identity-bearing value and native event/callback/ref adaptations.
export const rootProps = {
  defaultValue: Symbol('tab'), orientation: 'vertical',
  class: (state) => ['tabs', { vertical: state.orientation === 'vertical' }],
  onValueChange(value, details) {
    const direction: Tabs.Tab.ActivationDirection = details.activationDirection;
    const event: Event = details.event;
    const reason: Tabs.Root.ChangeEventReason = details.reason;
    void [value, direction, event, reason];
    details.cancel();
  },
} satisfies Tabs.Root.Props;
export const listProps = { activateOnFocus: true, loopFocus: false } satisfies Tabs.List.Props;
export const tabProps = {
  value: () => 'identity', nativeButton: false,
  onClick(event) {
    const button: HTMLButtonElement = event.currentTarget;
    void button;
    event.preventBaseUIHandler();
  },
  ref: [(node: HTMLButtonElement) => { node.focus(); }],
  render(props, state) {
    const active: boolean = state.active;
    const attributes: JSX.HTMLAttributes<HTMLElement> = props;
    void [active, attributes];
    return null;
  },
} satisfies Tabs.Tab.Props;
export const panelProps = { value: {}, keepMounted: true } satisfies Tabs.Panel.Props;
export const indicatorProps = {
  renderBeforeHydration: true,
  class(state) {
    const size: Tabs.Tab.Size | null = state.activeTabSize;
    const position: Tabs.Tab.Position | null = state.activeTabPosition;
    void [size, position];
    return 'indicator';
  },
} satisfies Tabs.Indicator.Props;
// @ts-expect-error Tabs has no "both" orientation.
export const invalidRoot: Tabs.Root.Props = { orientation: 'both' };
// @ts-expect-error Tab requires an explicit identity-bearing value.
export const invalidTab: Tabs.Tab.Props = {};
// @ts-expect-error Panel requires its corresponding value.
export const invalidPanel: Tabs.Panel.Props = {};
// @ts-expect-error Activation mode is a boolean, not a string enum.
export const invalidList: Tabs.List.Props = { activateOnFocus: 'automatic' };
