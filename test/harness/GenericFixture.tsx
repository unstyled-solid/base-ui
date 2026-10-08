import type { JSX } from '@solidjs/web';

export function GenericFixture<Value>(props: { value: Value }) {
  const Child = (child: { value: Value }) => <output>{String(child.value)}</output>;
  // Native RC13 SSR incorrectly captures Value (a type) as a runtime variable.
  return <Child value={props.value as Value} />;
}

export function GenericChildren<Value>(props: { values: Value[]; render: (value: Value) => JSX.Element }) {
  return <div>{props.values.map((value: Value) => props.render(value))}</div>;
}
