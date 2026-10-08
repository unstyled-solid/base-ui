var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import clsx from 'clsx';
import { Radio } from 'baseui-solid2/radio';

export function Root(allProps: Radio.Root.Props) {
const props = omit(allProps, 'class');
  return (
    <Radio.Root
      class={clsx(
        'flex size-4 shrink-0 items-center justify-center rounded-full border border-neutral-950 bg-white p-0 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-checked:bg-neutral-950 data-checked:text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 dark:data-checked:bg-white dark:data-checked:text-neutral-950',
        allProps.class,
      )}
      {...props}
    />
  );
}

export function Indicator(allProps: Radio.Indicator.Props) {
const props = omit(allProps, 'class');
  return (
    <Radio.Indicator
      class={clsx(
        'flex items-center justify-center data-unchecked:hidden before:size-2 before:rounded-full before:bg-current',
        allProps.class,
      )}
      {...props}
    />
  );
}
`;export{e as default};