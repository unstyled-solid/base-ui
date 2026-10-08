import { omit } from 'solid-js';
import clsx from 'clsx';
import { Slider } from 'baseui-solid2/slider';

export function Root(allProps: Slider.Root.Props<any>) {
const props = omit(allProps, 'class');
  return <Slider.Root class={clsx('grid grid-cols-2', allProps.class)} {...props} />;
}

export function Value(allProps: Slider.Value.Props) {
const props = omit(allProps, 'class');
  return (
    <Slider.Value
      class={clsx('text-sm font-normal text-neutral-950 dark:text-white', allProps.class)}
      {...props}
    />
  );
}

export function Control(allProps: Slider.Control.Props) {
const props = omit(allProps, 'class');
  return (
    <Slider.Control
      class={clsx('flex col-span-2 touch-none items-center py-3 select-none', allProps.class)}
      {...props}
    />
  );
}

export function Track(allProps: Slider.Track.Props) {
const props = omit(allProps, 'class');
  return (
    <Slider.Track
      class={clsx('h-1 w-full bg-neutral-200 select-none dark:bg-neutral-800', allProps.class)}
      {...props}
    />
  );
}

export function Indicator(allProps: Slider.Indicator.Props) {
const props = omit(allProps, 'class');
  return (
    <Slider.Indicator
      class={clsx('bg-neutral-950 select-none dark:bg-white', allProps.class)}
      {...props}
    />
  );
}

export function Thumb(allProps: Slider.Thumb.Props) {
const props = omit(allProps, 'class');
  return (
    <Slider.Thumb
      class={clsx(
        'size-4 border border-neutral-950 bg-white select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-950 dark:has-[:focus-visible]:outline-white dark:border-white dark:bg-neutral-950',
        allProps.class,
      )}
      {...props}
    />
  );
}
