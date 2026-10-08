import { expectType } from '../../../test';
import { Accordion } from '../index';

// Source generic inference fixtures, adapted only from React JSX to RC13 JSX.
<Accordion.Root value={['a']} onValueChange={(value) => { expectType<string[], typeof value>(value); }} />;
<Accordion.Root defaultValue={[1]} onValueChange={(value) => { expectType<number[], typeof value>(value); }} />;
<Accordion.Root<'a' | 'b'> value={['a']} />;
<Accordion.Root<'a' | 'b'> onValueChange={(value) => { expectType<('a' | 'b')[], typeof value>(value); }} />;
<Accordion.Root<string | null> value={['a', null]} onValueChange={(value) => { expectType<(string | null)[], typeof value>(value); }} />;
<Accordion.Root onValueChange={(value) => { expectType<any[], typeof value>(value); }} />;
// @ts-expect-error Explicit generic constrains selected values.
<Accordion.Root<'a' | 'b'> value={['c']} />;
// @ts-expect-error Selection is array-valued in single mode too.
<Accordion.Root<string> value="a" />;
const handleChange: NonNullable<Accordion.Root.Props<'a'>['onValueChange']> = (value) => { expectType<'a'[], typeof value>(value); };
<Accordion.Root<'a'> onValueChange={handleChange} />;
const defaultChange: NonNullable<Accordion.Root.Props['onValueChange']> = (value) => { expectType<any[], typeof value>(value); };
<Accordion.Root onValueChange={defaultChange} />;
export function Wrapper<Value>(props: Accordion.Root.Props<Value>) { return <Accordion.Root {...props} />; }

const arrayItem = ['section', 'details'];
<Accordion.Root defaultValue={[arrayItem]} onValueChange={(value) => { expectType<string[][], typeof value>(value); }} />;
<Accordion.Root value={[{ id: 1 }]} onValueChange={(value) => { expectType<{ id: number }[], typeof value>(value); }} />;
<Accordion.Trigger onClick={(event) => {
  const target: HTMLButtonElement = event.currentTarget;
  void target;
  event.preventBaseUIHandler();
}} />;
<Accordion.Item onOpenChange={(_open, details) => {
  if (details.reason === 'trigger-press') {
    expectType<MouseEvent | KeyboardEvent | PointerEvent | TouchEvent, typeof details.event>(details.event);
  }
  details.cancel();
}} />;
