var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Slider } from 'baseui-solid2/slider';

export default function VerticalSlider() {
  return (
    <Slider.Root orientation="vertical" defaultValue={35}>
      <Slider.Control class="flex touch-none select-none data-[orientation=vertical]:h-32 data-[orientation=vertical]:px-3">
        <Slider.Track class="bg-neutral-200 select-none dark:bg-neutral-800 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1">
          <Slider.Indicator class="bg-neutral-950 select-none dark:bg-white" />
          <Slider.Thumb
            aria-label="Volume"
            class="size-4 border border-neutral-950 bg-white select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-950 dark:has-[:focus-visible]:outline-white dark:border-white dark:bg-neutral-950"
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}
`;export{e as default};