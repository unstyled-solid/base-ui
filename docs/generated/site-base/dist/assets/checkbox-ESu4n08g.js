var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import clsx from 'clsx';
import { Checkbox } from 'baseui-solid2/checkbox';

export function Root(allProps: Checkbox.Root.Props) {
const props = omit(allProps, 'class');
  return (
    <Checkbox.Root
      class={clsx(
        'flex size-4 shrink-0 items-center justify-center rounded-none border border-neutral-950 bg-white p-0 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-checked:bg-neutral-950 data-checked:text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 dark:data-checked:bg-white dark:data-checked:text-neutral-950',
        allProps.class,
      )}
      {...props}
    />
  );
}

export function Indicator(allProps: Checkbox.Indicator.Props) {
const props = omit(allProps, 'class');
  return (
    <Checkbox.Indicator class={clsx('flex data-unchecked:hidden', allProps.class)} {...props} />
  );
}
`;export{e as default};