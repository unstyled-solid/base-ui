import { createMemo, createSignal, flush, Loading } from 'solid-js';
import { expect, it } from 'vitest';
import { createRenderer } from '../../test';
import { CheckboxGroup } from './CheckboxGroup';
import { useCheckboxGroupContext } from './CheckboxGroupContext';
import { createChangeEventDetails } from '../internals/createBaseUIEventDetails';

const { render } = createRenderer();

it('composes accepted requests while their batch is held by consumer async work', async () => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  let group!: NonNullable<ReturnType<typeof useCheckboxGroupContext>>;
  function Probe() { group = useCheckboxGroupContext()!; return null; }
  const view = await render(() => {
    const [revision, setRevision] = createSignal(0);
    const result = createMemo(() => revision() ? held.then(() => 'ready') : 'initial');
    return <>
      <Loading><span data-testid="async">{result()}</span></Loading>
      <CheckboxGroup onValueChange={() => setRevision(1)}><Probe /></CheckboxGroup>
    </>;
  });
  try {
    group.setValue(['a'], createChangeEventDetails('none'));
    expect(group.getRequestValue()).toEqual(['a']);
    // Drain the scheduled flush and microtask expiry without releasing the hold.
    await Promise.resolve();
    await Promise.resolve();
    expect(group.value).toEqual([]);
    expect(view.getByTestId('async')).toHaveTextContent('initial');
    expect(group.getRequestValue()).toEqual(['a']);
    group.setValue([...group.getRequestValue(), 'b'], createChangeEventDetails('none'));
    release();
    await held;
    await Promise.resolve();
    flush();
    expect(group.value).toEqual(['a', 'b']);
  } finally {
    release();
  }
});

it.each(['refuse', 'cancel'] as const)('does not retain a %s proposal during a hold', async (mode) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  let group!: NonNullable<ReturnType<typeof useCheckboxGroupContext>>;
  function Probe() { group = useCheckboxGroupContext()!; return null; }
  await render(() => {
    const [revision, setRevision] = createSignal(0);
    const result = createMemo(() => revision() ? held.then(() => 'ready') : 'initial');
    return <>
      <Loading>{result()}</Loading>
      <CheckboxGroup value={mode === 'refuse' ? [] : undefined} onValueChange={(_, details) => {
        setRevision(1);
        if (mode === 'cancel') details.cancel();
      }}><Probe /></CheckboxGroup>
    </>;
  });
  try {
    group.setValue(['a'], createChangeEventDetails('none'));
    expect(group.getRequestValue()).toEqual([]);
    await Promise.resolve();
    expect(group.getRequestValue()).toEqual([]);
  } finally { release(); await held; flush(); }
});
