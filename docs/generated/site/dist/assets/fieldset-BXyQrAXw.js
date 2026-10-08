var e=`import { omit } from 'solid-js';
import clsx from 'clsx';
import { Fieldset } from 'baseui-solid2/fieldset';

export function Root(props: Fieldset.Root.Props) {
  return <Fieldset.Root {...props} />;
}

export function Legend(allProps: Fieldset.Legend.Props) {
const props = omit(allProps, 'class');
  return (
    <Fieldset.Legend
      class={clsx('text-sm font-bold text-neutral-950 dark:text-white', allProps.class)}
      {...props}
    />
  );
}
`;export{e as default};