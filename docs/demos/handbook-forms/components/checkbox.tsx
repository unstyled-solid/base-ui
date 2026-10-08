import { omit } from 'solid-js';
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
