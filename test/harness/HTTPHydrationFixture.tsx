import { createSignal, createUniqueId, createMemo, Loading, onSettled, untrack } from 'solid-js';

export function HTTPHydrationFixture(props: { label: string; initial: string; onReady?: () => void; onDispose?: () => void }) {
  const id = createUniqueId();
  const [value, setValue] = createSignal(untrack(() => props.initial));
  onSettled(() => { props.onReady?.(); return props.onDispose; });
  return <section><label for={id}>{props.label}</label><input id={id} value={value()} onInput={event => setValue(event.currentTarget.value)} /><output>{value()}</output></section>;
}

export function HTTPStreamingFixture(props: { label: string }) {
  const value = createMemo(async () => props.label);
  return <Loading fallback="pending"><p>{value()}</p></Loading>;
}
