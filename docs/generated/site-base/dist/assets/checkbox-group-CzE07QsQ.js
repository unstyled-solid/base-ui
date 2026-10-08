var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import clsx from 'clsx';
import { CheckboxGroup as BaseCheckboxGroup } from 'baseui-solid2/checkbox-group';

export function CheckboxGroup(allProps: BaseCheckboxGroup.Props) {
const props = omit(allProps, 'class');
  return (
    <BaseCheckboxGroup
      class={clsx(
        'flex flex-col items-start gap-1 text-neutral-950 dark:text-white',
        allProps.class,
      )}
      {...props}
    />
  );
}
`;export{e as default};