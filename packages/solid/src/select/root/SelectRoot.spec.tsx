import { Select } from '../index';

const objects = [{ id: 1, label: 'One' }, { id: 2, label: 'Two' }] as const;
const strings: readonly string[] = ['a', 'b'];
<Select.Root multiple value={strings} onValueChange={value => { value.pop(); }} />;
<Select.Root multiple defaultValue={objects} itemToStringLabel={item => item.label} itemToStringValue={item => String(item.id)} isItemEqualToValue={(a, b) => a.id === b.id} onValueChange={value => { value.pop(); }} />;
<Select.Root value={objects[0]} onValueChange={value => {
  // @ts-expect-error single values can become null
  value.id;
}} />;
<Select.Root<string, true>
  multiple
  // @ts-expect-error multiple input requires a readonly array
  value="a"
/>;
<Select.Root<string> value="a" onValueChange={value => {
  // @ts-expect-error single output is not an array
  value.pop();
}} />;
<Select.Root items={[{ heading: 'Fruit', items: [{ value: 'a', label: 'Apple' }] }] as const} value={null} />;
<Select.Root actionsRef={actions => actions?.highlightItem('none')} />;
<Select.Root actionsRef={actions => {
  // @ts-expect-error numeric highlight requests are not public Select targets
  actions?.highlightItem(1);
}} />;
export function Wrapper<Value, Multiple extends boolean | undefined = false>(props: Select.Root.Props<Value, Multiple>) { return <Select.Root {...props} />; }

const tuple = ['javascript', 'typescript'] as const;
<Select.Root multiple value={tuple} onValueChange={value => {
  const exact: ('javascript' | 'typescript')[] = value;
  exact.pop();
  // @ts-expect-error readonly input does not widen callback elements to numbers
  const wrong: number[] = value;
  void wrong;
}} />;
<Select.Root items={[{ value: 'a', label: 'Apple' }] as const} defaultValue="a" itemToStringLabel={item => item.toUpperCase()} itemToStringValue={item => item} onValueChange={value => {
  // @ts-expect-error inferred single output is nullable
  value.toUpperCase();
}} />;
<Select.Root multiple
  // @ts-expect-error multiple input cannot be scalar
  defaultValue="a"
/>;
<Select.Root<string> multiple={false}
  // @ts-expect-error explicit single input cannot be an array
  defaultValue={['a']}
/>;
<Select.Root<string, boolean> multiple={Math.random() > 0.5} onValueChange={value => {
  // @ts-expect-error runtime multiple flag does not guarantee an array output
  value.pop();
}} />;
// @ts-expect-error Label derives its ID from Root
<Select.Label id="custom" />;
// @ts-expect-error Item IDs belong to the collection
<Select.Item id="custom" />;
// @ts-expect-error pinned Portal has no keepMounted prop
<Select.Portal keepMounted />;
