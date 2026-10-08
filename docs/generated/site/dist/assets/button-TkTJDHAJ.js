var e=`import { omit } from 'solid-js';
import { Button as BaseButton } from 'baseui-solid2/button';
import clsx from 'clsx';

export function Button(allProps: BaseButton.Props) {
const props = omit(allProps, 'class');
  return (
    <BaseButton
      type="button"
      class={clsx(
        'flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 py-0 font-[inherit] text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400 dark:disabled:border-neutral-400 dark:disabled:text-neutral-400',
        allProps.class,
      )}
      {...props}
    />
  );
}
`;export{e as default};