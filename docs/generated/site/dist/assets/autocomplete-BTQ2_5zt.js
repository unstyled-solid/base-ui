var e=`import { omit } from 'solid-js';
import clsx from 'clsx';
import { Autocomplete } from 'baseui-solid2/autocomplete';

export function Root(props: Autocomplete.Root.Props<any>) {
  return <Autocomplete.Root {...props} />;
}

export const Input = function Input(allProps: Autocomplete.Input.Props) {
const props = omit(allProps, 'class');
  return (
    <Autocomplete.Input
      class={clsx(
        'h-8 w-[16rem] border border-neutral-950 bg-white px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white md:w-[20rem] dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400',
        allProps.class,
      )}
      {...props}
    />
  );
};

export function Portal(props: Autocomplete.Portal.Props) {
  return <Autocomplete.Portal {...props} />;
}

export function Positioner(allProps: Autocomplete.Positioner.Props) {
const props = omit(allProps, 'class');
  return (
    <Autocomplete.Positioner
      class={clsx('outline-none data-empty:hidden', allProps.class)}
      sideOffset={4}
      {...props}
    />
  );
}

export function Popup(allProps: Autocomplete.Popup.Props) {
const props = omit(allProps, 'class');
  return (
    <Autocomplete.Popup
      class={clsx(
        'w-(--anchor-width) max-w-(--available-width) border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none',
        allProps.class,
      )}
      {...props}
    />
  );
}

export function List(allProps: Autocomplete.List.Props) {
const props = omit(allProps, 'class');
  return (
    <Autocomplete.List
      class={clsx(
        'max-h-[min(22.5rem,var(--available-height))] overflow-y-auto overscroll-contain py-1 scroll-py-1 outline-0 data-empty:p-0',
        allProps.class,
      )}
      {...props}
    />
  );
}

export function Item(allProps: Autocomplete.Item.Props) {
const props = omit(allProps, 'class');
  return (
    <Autocomplete.Item
      class={clsx(
        'flex cursor-default flex-col gap-0.25 py-2 pr-8 pl-2 text-sm leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white',
        allProps.class,
      )}
      {...props}
    />
  );
}
`;export{e as default};