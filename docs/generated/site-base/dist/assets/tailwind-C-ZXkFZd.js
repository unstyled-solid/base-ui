var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Input } from 'baseui-solid2/input';

export default function ExampleInput() {
  return (
    <label class="flex flex-col items-start gap-1 text-sm font-bold text-neutral-950 dark:text-white">
      Name
      <Input
        placeholder="e.g. Colm Tuite"
        class="h-8 w-40 border border-neutral-950 dark:border-white bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white"
      />
    </label>
  );
}
`;export{e as default};