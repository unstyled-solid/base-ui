import { ToggleGroup } from './ToggleGroup';

// Pinned React ToggleGroup.spec.tsx: readonly inputs, mutable inferred proposals.

const values = ['a', 'b', 'c'];
<ToggleGroup value={values} onValueChange={(value) => {
  value satisfies string[];
  value.push('d');
}} />;

const narrowedValues = ['a', 'b', 'c'] as const;
type Value = (typeof narrowedValues)[number];
<ToggleGroup value={narrowedValues} defaultValue={narrowedValues} onValueChange={(value) => {
  value satisfies Value[];
  // @ts-expect-error Source inference preserves the readonly input's literal union.
  value.push('d');
}} />;

function readonlyInputs(props: ToggleGroup.Props) {
  if (props.value) {
    props.value satisfies readonly string[];
    // @ts-expect-error Controlled values cannot be mutated by the consumer.
    props.value.push('d');
  }
  if (props.defaultValue) {
    props.defaultValue satisfies readonly string[];
    // @ts-expect-error Initial values cannot be mutated by the consumer.
    props.defaultValue.push('d');
  }
}

<ToggleGroup value={narrowedValues} ref={(node) => {
  node satisfies HTMLDivElement;
}} onClick={(event) => {
  event.currentTarget satisfies HTMLDivElement;
  event.preventBaseUIHandler();
}} render={(props, state) => <div {...props} data-mode={state.multiple ? 'multiple' : 'single'} />} />;
