var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Field } from 'baseui-solid2/field';
import { Fieldset } from 'baseui-solid2/fieldset';

export default function ExampleField() {
  return (
    <Fieldset.Root class="flex w-full max-w-64 flex-col gap-4">
      <Fieldset.Legend class="border-b border-neutral-950 text-base font-bold text-neutral-950 dark:border-white dark:text-white">
        Billing details
      </Fieldset.Legend>

      <Field.Root class="flex flex-col items-start gap-1">
        <Field.Label class="text-sm font-bold text-neutral-950 dark:text-white">
          Company
        </Field.Label>
        <Field.Control
          placeholder="Enter company name"
          class="h-8 w-full border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white dark:placeholder:text-neutral-400"
        />
      </Field.Root>

      <Field.Root class="flex flex-col items-start gap-1">
        <Field.Label class="text-sm font-bold text-neutral-950 dark:text-white">
          Tax ID
        </Field.Label>
        <Field.Control
          placeholder="Enter fiscal number"
          class="h-8 w-full border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white dark:placeholder:text-neutral-400"
        />
      </Field.Root>
    </Fieldset.Root>
  );
}
`;export{e as default};