var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import clsx from 'clsx';
import { Form as BaseForm } from 'baseui-solid2/form';

export function Form(allProps: BaseForm.Props) {
const props = omit(allProps, 'class');
  return (
    <BaseForm
      class={clsx('flex w-full max-w-3xs flex-col gap-5 sm:max-w-[20rem]', allProps.class)}
      {...props}
    />
  );
}
`;export{e as default};