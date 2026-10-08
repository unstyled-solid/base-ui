var e=`import type { ComponentProps } from '@solidjs/web';
import { Collapsible } from 'baseui-solid2/collapsible';
import styles from './index.module.css';

export default function ExampleCollapsible() {
  return (
    <Collapsible.Root class={styles.Collapsible}>
      <Collapsible.Trigger class={styles.Trigger}>
        Recovery keys
        <CaretRightIcon class={styles.Icon} />
      </Collapsible.Trigger>
      <Collapsible.Panel class={styles.Panel}>
        <div class={styles.Content}>
          <div>alien-bean-pasta</div>
          <div>wild-irish-burrito</div>
          <div>horse-battery-staple</div>
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

export function CaretRightIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      {...props}
      style={{ display: 'block', ...(typeof props.style === 'object' ? props.style : {}) }}
    >
      <path d="M6 12V4l4.5 4z" />
    </svg>
  );
}
`;export{e as default};