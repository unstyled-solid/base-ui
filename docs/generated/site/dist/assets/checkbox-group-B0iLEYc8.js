var e=`import { omit } from 'solid-js';
import clsx from 'clsx';
import { CheckboxGroup as BaseCheckboxGroup } from 'baseui-solid2/checkbox-group';

export function CheckboxGroup(allProps: BaseCheckboxGroup.Props) {
const props = omit(allProps, 'class');
  return (
    <BaseCheckboxGroup
      class={clsx(
        'flex flex-col items-start gap-1 text-neutral-950 dark:text-white',
        allProps.class,
      )}
      {...props}
    />
  );
}
`;export{e as default};