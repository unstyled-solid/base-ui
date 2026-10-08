var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Meter } from 'baseui-solid2/meter';

export default function ExampleMeter() {
  return (
    <Meter.Root class="grid max-w-full w-60 grid-cols-2 gap-y-2" value={24}>
      <Meter.Label class="text-sm font-normal text-neutral-950 dark:text-white">
        Storage Used
      </Meter.Label>
      <Meter.Value class="text-right text-sm text-neutral-950 dark:text-white" />
      <Meter.Track class="col-span-2 h-3 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <Meter.Indicator class="bg-neutral-950 transition-[width] duration-500 dark:bg-white" />
      </Meter.Track>
    </Meter.Root>
  );
}
`;export{e as default};