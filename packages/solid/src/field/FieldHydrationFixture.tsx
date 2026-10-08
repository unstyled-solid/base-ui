import { createSignal } from 'solid-js';
import { Field } from './index';

export function FieldHydrationFixture(props: { onValueChange?: (value: string) => void } = {}) {
  const [value, setValue] = createSignal('seed');
  const [reset, setReset] = createSignal('initial');
  return <form>
    <Field.Root name="controlled"><Field.Label>Controlled</Field.Label>
      <Field.Control value={value()} onValueChange={(next) => { props.onValueChange?.(next); if (!next.includes('!')) setValue(next); }} />
    </Field.Root>
    <Field.Root name="free"><Field.Label>Free</Field.Label><Field.Control defaultValue={reset()} /></Field.Root>
    <button type="button" onClick={() => setReset('reset')}>Update default</button>
    <button type="reset">Reset</button>
  </form>;
}
