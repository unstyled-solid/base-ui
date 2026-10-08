var e=`import { omit } from 'solid-js';
import clsx from 'clsx';
import { RadioGroup as BaseRadioGroup } from 'baseui-solid2/radio-group';

export function RadioGroup<Value>(allProps: BaseRadioGroup.Props<Value>) {
const props = omit(allProps, 'class');
  return (
    <BaseRadioGroup
      class={clsx(
        'flex w-full flex-row items-start gap-1 text-neutral-950 dark:text-white',
        allProps.class,
      )}
      {...props}
    />
  );
}
`;export{e as default};