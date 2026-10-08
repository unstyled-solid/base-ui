var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Slider } from 'baseui-solid2/slider';

export default function StepsSlider() {
  return (
    <Slider.Root
      class="grid w-56 grid-cols-2"
      defaultValue={400}
      min={100}
      max={900}
      step={100}
      largeStep={200}
    >
      <Slider.Label class="cursor-default text-sm text-neutral-950 dark:text-white">
        Playback speed
      </Slider.Label>
      <Slider.Value class="text-end text-sm text-neutral-950 dark:text-white" />
      <Slider.Control class="col-span-2 flex touch-none items-center py-3 select-none">
        <Slider.Track class="h-1 w-full bg-neutral-200 select-none dark:bg-neutral-800">
          <Slider.Indicator class="bg-neutral-950 select-none dark:bg-white" />
          <Slider.Thumb class="size-4 border border-neutral-950 bg-white select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-950 dark:has-[:focus-visible]:outline-white dark:border-white dark:bg-neutral-950" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}
`;export{e as default};