import { createContext, createEffect, createMemo, createSignal, useContext } from 'solid-js';
import { render } from '@solidjs/web';

/** No Base UI imports, registry, preview wrapper, HMR update, or async loader. */
export function mountContextProbe(host: HTMLElement) {
  const Context = createContext<string>();
  let update = () => {};
  let reads = 0;
  const stacks: string[] = [];
  const readContext = () => {
    reads++;
    try {
      return useContext(Context);
    } catch (error) {
      stacks.push(error instanceof Error ? error.stack ?? error.message : String(error));
      throw error;
    }
  };
  const Probe = () => {
    const [version, setVersion] = createSignal(0);
    update = () => { setVersion(value => value + 1); };
    const record = createMemo(() => {
      version();
      // Lazy JSX getters must not be evaluated by an output diagnostic.
      return { get children() { const value = readContext(); return <span>{value}</span>; } };
    });
    createEffect(record, () => undefined);
    return <button onClick={() => update()}>Update lazy record</button>;
  };
  const dispose = render(() => <Context value="provided"><Probe /></Context>, host);
  return { update, dispose, evidence: () => ({ reads, stacks }) };
}
