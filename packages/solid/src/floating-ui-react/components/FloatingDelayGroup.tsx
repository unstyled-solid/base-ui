// Adapted from Base UI (MIT), pinned FloatingDelayGroup.tsx at 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createContext, createEffect, createMemo, createSignal, onCleanup, useContext, type Accessor } from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import { createTimeout } from '../../utils/createTimeout';
import type { FloatingRootContext } from '../../internals/contracts/floating';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { getDelay, type HoverDelay } from '../hooks/hoverShared';

export interface FloatingDelayGroupProps { children?: JSX.Element; delay: HoverDelay; timeoutMs?: number | undefined }
interface Member { read(): { root: FloatingRootContext; id: string | undefined; open: boolean } }
interface Active { member: Member; root: FloatingRootContext; id: string | undefined }
interface GroupState {
  members: Map<Member, ReturnType<Member['read']>>;
  active: Active | null;
  instant: Map<Member, boolean>;
  close: Active[];
}
interface GroupContext {
  readonly delay: HoverDelay;
  state: Accessor<GroupState>;
  register(member: Member): () => void;
}
export const FloatingDelayGroupContext = createContext<GroupContext | null>(null);

export function FloatingDelayGroup(props: FloatingDelayGroupProps): JSX.Element {
  const timeout = createTimeout();
  const [members, setMembers] = createSignal<readonly Member[]>([], { ownedWrite: true });
  // Timeout expiry is external temporal input, not a relay of open state.
  const [expired, setExpired] = createSignal<Active | null>(null);
  const state = createMemo<GroupState>((previous) => {
    const current = new Map(members().map(member => [member, member.read()] as const));
    let active = previous?.active ?? null;
    const instant = new Map(previous?.instant);
    for (const member of instant.keys()) if (!current.has(member)) instant.delete(member);
    // React retains the window when the last closed consumer unmounts, but
    // resets it when an open active consumer is disposed (source lines 253-267).
    if (active && ((!current.has(active.member) && previous?.members.get(active.member)?.open) || expired() === active)) active = null;
    const close = (previous?.close ?? []).filter(entry => current.get(entry.member)?.open);
    for (const [member, next] of current) {
      const before = previous?.members.get(member);
      if (!next.open || before?.open && before.root === next.root && before.id === next.id) continue;
      const prior = active;
      active = { member, root: next.root, id: next.id };
      const handoff = prior !== null && prior.id !== next.id;
      instant.set(member, handoff);
      if (prior && current.has(prior.member)) instant.set(prior.member, handoff);
      if (handoff && prior) close.push(prior);
    }
    if (active && current.get(active.member)?.open !== true) {
      if (current.has(active.member)) instant.set(active.member, false);
      if (!props.timeoutMs) active = null;
    }
    const sameMembers = previous && current.size === previous.members.size && [...current].every(([member, next]) => {
      const before = previous.members.get(member);
      return before?.root === next.root && before.id === next.id && before.open === next.open;
    });
    const sameInstant = previous && instant.size === previous.instant.size && [...instant].every(([member, value]) => previous.instant.get(member) === value);
    if (previous && sameMembers && sameInstant && active === previous.active && close.length === previous.close.length && close.every((entry, index) => entry === previous.close[index])) return previous;
    return { members: current, active, instant, close };
  }, { name: 'FloatingDelayGroup.state', transparent: true });

  const closes = createMemo(() => state().close, {
    equals: (before, next) => before.length === next.length && before.every((entry, index) => entry === next[index]),
    transparent: true,
  });
  createEffect(closes, entries => {
    // Source lines 234-237: only a different-id takeover closes its predecessor.
    for (const entry of entries) entry.root.setOpen(false, createChangeEventDetails('none'));
  });
  const clock = createMemo(() => {
    const next = state(), active = next.active;
    return { active, open: active !== null && next.members.get(active.member)?.open === true, timeoutMs: props.timeoutMs ?? 0 };
  }, { equals: (before, next) => before.active === next.active && before.open === next.open && before.timeoutMs === next.timeoutMs, transparent: true });
  createEffect(clock, next => {
    timeout.clear();
    const active = next.active;
    if (active && !next.open && next.timeoutMs) timeout.start(next.timeoutMs, () => {
      // Source lines 185-191 checks the root's latest open state, which can
      // differ from this trigger's options.open on a multi-trigger root.
      if (!active.root.state.open) setExpired(active);
    });
    return timeout.clear;
  });
  const context: GroupContext = {
    get delay() { return props.delay; }, state,
    register(member) {
      setMembers(previous => [...previous, member]);
      return () => { setMembers(previous => previous.filter(value => value !== member)); };
    },
  };
  return <FloatingDelayGroupContext value={context}>{props.children}</FloatingDelayGroupContext>;
}

export function createDelayGroup(input: FloatingRootContext | Accessor<FloatingRootContext>, options: { open: boolean | Accessor<boolean> } = { open: false }) {
  const group = useContext(FloatingDelayGroupContext);
  const root = () => typeof input === 'function' ? input() : input;
  const open = () => typeof options.open === 'function' ? options.open() : options.open;
  const member: Member = { read: () => ({ root: root(), id: root().state.floatingId, open: open() }) };
  // React's layout effects never enroll consumers during SSR. Keep server
  // renders equally inert instead of writing the client membership registry.
  if (group && !isServer) onCleanup(group.register(member));
  // The history above is a pure reduction over current open/id/root inputs.
  // Instant flags reach consumers in the same flush as open, never a later
  // signal-writing effect. Equality also isolates unrelated group consumers.
  const instant = createMemo(() => group?.state().instant.get(member) ?? false, { name: 'createDelayGroup.instant', transparent: true });
  return {
    hasProvider: group !== null,
    activeIdRef: { get current() { return group?.state().active?.id ?? null; } },
    delayRef: { get current(): HoverDelay { return group?.state().active ? { open: 0, close: getDelay(group.delay, 'close') } : group?.delay ?? 0; } },
    get isInstantPhase() { return instant(); },
  };
}
export { createDelayGroup as useDelayGroup };
