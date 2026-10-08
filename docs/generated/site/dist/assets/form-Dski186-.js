var e=`import { omit } from 'solid-js';
import clsx from 'clsx';
import { Form as BaseForm } from 'baseui-solid2/form';

export function Form(allProps: BaseForm.Props) {
const props = omit(allProps, 'class');
  return (
    <BaseForm
      class={clsx('flex w-full max-w-3xs flex-col gap-5 sm:max-w-[20rem]', allProps.class)}
      {...props}
    />
  );
}
`;export{e as default};