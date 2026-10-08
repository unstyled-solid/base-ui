import { createSignal, createUniqueId, merge, omit, untrack } from 'solid-js';
import type { ConformantComponentProps } from '../../packages/solid/test/describeConformance';
import type { TestedComponentProps } from '../../packages/solid/test/popupConformanceTests';
import { mergeRefs } from '../../packages/solid/test';

export interface FixtureState { readonly active: boolean }
export interface FixtureProps extends ConformantComponentProps<FixtureState> { active?: boolean }
/** Harness-only contract fixture, not a production component or a parity claim. */
export function ConformantFixture(props: FixtureProps) {
  const state = { get active() { return props.active ?? false; } };
  const rest = omit(props, 'active', 'render', 'class', 'style', 'nativeButton', 'ref');
  const ref = mergeRefs<HTMLElement>(untrack(() => props.ref));
  const host = {
    ref,
    get class() { return typeof props.class === 'function' ? props.class(state) : props.class; },
    get style() { return typeof props.style === 'function' ? props.style(state) : props.style; },
  };
  const render = untrack(() => props.render);
  return render ? render(merge(rest, host), state) : <div {...rest} ref={ref} class={host.class} style={host.style} />;
}

export function PopupFixture(props: TestedComponentProps) {
  const id = createUniqueId();
  const [local, setLocal] = createSignal(false);
  const open = () => props.root?.open ?? local();
  const popupId = () => props.popup?.id ?? id;
  return <>
    <button {...props.trigger} aria-expanded={open() ? 'true' : 'false'} aria-haspopup="dialog" aria-controls={open() ? popupId() : undefined} onClick={() => {
      const next = !open();
      props.root?.onOpenChange?.(next);
      if (props.root?.open === undefined) setLocal(next);
    }}>Open</button>
    {(open() || props.portal?.keepMounted) && <div {...props.popup} id={popupId()} role="dialog"
      data-open={open() ? '' : undefined} data-ending-style={!open() ? '' : undefined} aria-hidden={open() ? undefined : 'true'} />}
  </>;
}
