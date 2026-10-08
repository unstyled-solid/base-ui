var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import clsx from 'clsx';
import { Fieldset } from 'baseui-solid2/fieldset';

export function Root(props: Fieldset.Root.Props) {
  return <Fieldset.Root {...props} />;
}

export function Legend(allProps: Fieldset.Legend.Props) {
const props = omit(allProps, 'class');
  return (
    <Fieldset.Legend
      class={clsx('text-sm font-bold text-neutral-950 dark:text-white', allProps.class)}
      {...props}
    />
  );
}
`;export{e as default};