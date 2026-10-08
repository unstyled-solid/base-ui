var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Field } from 'baseui-solid2/field';
import { Fieldset } from 'baseui-solid2/fieldset';
import styles from './index.module.css';

export default function ExampleField() {
  return (
    <Fieldset.Root class={styles.Fieldset}>
      <Fieldset.Legend class={styles.Legend}>Billing details</Fieldset.Legend>

      <Field.Root class={styles.Field}>
        <Field.Label class={styles.Label}>Company</Field.Label>
        <Field.Control placeholder="Enter company name" class={styles.Input} />
      </Field.Root>

      <Field.Root class={styles.Field}>
        <Field.Label class={styles.Label}>Tax ID</Field.Label>
        <Field.Control placeholder="Enter fiscal number" class={styles.Input} />
      </Field.Root>
    </Fieldset.Root>
  );
}
`;export{e as default};