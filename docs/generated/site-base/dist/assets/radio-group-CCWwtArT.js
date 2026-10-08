var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import clsx from 'clsx';
import { RadioGroup as BaseRadioGroup } from 'baseui-solid2/radio-group';

export function RadioGroup<Value>(allProps: BaseRadioGroup.Props<Value>) {
const props = omit(allProps, 'class');
  return (
    <BaseRadioGroup
      class={clsx(
        'flex w-full flex-row items-start gap-1 text-neutral-950 dark:text-white',
        allProps.class,
      )}
      {...props}
    />
  );
}
`;export{e as default};