import { children, createMemo, Show } from 'solid-js';
import { Portal, dynamic, type JSX } from '@solidjs/web';
import { createIsHydrated } from './hydration';

interface OwnedPortalContentProps { mount: HTMLElement | null; wait?: boolean | undefined; children?: JSX.Element }

/** Resolve child status in the logical owner/contexts before crossing the
 * client-only native Portal root. The native portal still owns DOM insertion,
 * delegated events and cleanup; the logical owner retains content across
 * container replacement and disposes it when the portal deliberately waits. */
export function OwnedPortalContent(props: OwnedPortalContentProps): JSX.Element {
  // Resolving JSX before the native Portal is safe only after hydration ends:
  // server portals have no keys for these logical-owner descendants to claim.
  const hydrated = createIsHydrated();
  function Projection(input: { mount: () => HTMLElement | null; source: () => JSX.Element }) {
    const source = createMemo(input.source);
    const content = children(source);
    const Projected = () => <Show when={input.mount()}><Portal mount={input.mount()!}>{source()}</Portal></Show>;
    // Read resolved status before crossing the portal, but retain the original
    // JSX ranges for insertion. Flattened values change when sibling slots do;
    // using them as portal identity would remove a still-focused retained host.
    const Ready = dynamic(() => { content(); return Projected; });
    return <Ready />;
  }
  // The first child status must be read before a deferred host ref settles,
  // otherwise Loading has already committed an empty first answer. Literal
  // null still deliberately waits, and server portals remain client-only.
  return <>{hydrated() && !props.wait && <Projection mount={() => props.mount} source={() => props.children} />}</>;
}
