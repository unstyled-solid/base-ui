var e=`import { omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import clsx from 'clsx';
import { Combobox } from 'baseui-solid2/combobox';

export function Root(props: Combobox.Root.Props<any, any>) {
  return <Combobox.Root {...props} />;
}

export const Input = function Input(allProps: Combobox.Input.Props) {
const props = omit(allProps, 'class');
  return (
    <Combobox.Input
      class={clsx(
        'h-full w-full border-0 bg-white pl-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 outline-none placeholder:text-neutral-500 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400',
        allProps.class,
      )}
      {...props}
    />
  );
};

export function InputGroup(allProps: Combobox.InputGroup.Props) {
const props = omit(allProps, 'class');
  return (
    <Combobox.InputGroup
      class={clsx(
        'relative h-8 w-64 border border-neutral-950 bg-white focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:focus-within:outline-white dark:border-white dark:bg-neutral-950 [&>input]:pr-[2.5rem] has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+2rem*2)]',
        allProps.class,
      )}
      {...props}
    />
  );
}

export function Clear(allProps: Combobox.Clear.Props) {
const props = omit(allProps, 'class');
  return (
    <Combobox.Clear
      class={clsx(
        'combobox-clear flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white',
        allProps.class,
      )}
      {...props}
    >
      <XIcon />
    </Combobox.Clear>
  );
}

export function Trigger(allProps: Combobox.Trigger.Props) {
const props = omit(allProps, 'class');
  return (
    <Combobox.Trigger
      class={clsx(
        'flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-950 dark:text-white',
        allProps.class,
      )}
      {...props}
    />
  );
}

export function Portal(props: Combobox.Portal.Props) {
  return <Combobox.Portal {...props} />;
}

export function Positioner(allProps: Combobox.Positioner.Props) {
const props = omit(allProps, 'class');
  return (
    <Combobox.Positioner class={clsx('outline-none', allProps.class)} sideOffset={4} {...props} />
  );
}

export function Popup(allProps: Combobox.Popup.Props) {
const props = omit(allProps, 'class');
  return (
    <Combobox.Popup
      class={clsx(
        'w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0/12%)] transition-[scale,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none',
        allProps.class,
      )}
      {...props}
    />
  );
}

export function Empty(allProps: Combobox.Empty.Props) {
const props = omit(allProps, 'class', 'children');
  return (
    <Combobox.Empty {...props}>
      {allProps.children ? (
        <div
          class={clsx(
            'py-4 pr-4 pl-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400',
            allProps.class,
          )}
        >
          {allProps.children}
        </div>
      ) : null}
    </Combobox.Empty>
  );
}

export function List(allProps: Combobox.List.Props) {
const props = omit(allProps, 'class');
  return (
    <Combobox.List
      class={clsx(
        'outline-0 overflow-y-auto scroll-py-[0.25rem] py-1 overscroll-contain max-h-[min(22.5rem,var(--available-height))] data-empty:p-0',
        allProps.class,
      )}
      {...props}
    />
  );
}

export function Item(allProps: Combobox.Item.Props) {
const props = omit(allProps, 'class');
  return (
    <Combobox.Item
      class={clsx(
        'grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white',
        allProps.class,
      )}
      {...props}
    />
  );
}

export function ItemIndicator(allProps: Combobox.ItemIndicator.Props) {
const props = omit(allProps, 'class');
  return <Combobox.ItemIndicator class={clsx('col-start-1', allProps.class)} {...props} />;
}

export function CaretDownIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      {...props}
      style={{ display: 'block', ...(typeof props.style === 'object' ? props.style : {}) }}
    >
      <path d="M12 6H4l4 4.5z" />
    </svg>
  );
}

function XIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-linecap="square"
      stroke-linejoin="round"
      {...props}
      style={{ display: 'block', ...(typeof props.style === 'object' ? props.style : {}) }}
    >
      <path d="m4.5 4.5 7 7m-7 0 7-7" />
    </svg>
  );
}
`;export{e as default};