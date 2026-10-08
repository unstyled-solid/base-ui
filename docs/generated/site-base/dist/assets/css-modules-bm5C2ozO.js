var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Tooltip } from 'baseui-solid2/tooltip';
import styles from '../../index.module.css';



export default function TooltipDetachedTriggersSimpleDemo() {
const demoTooltip = Tooltip.createHandle();

  return (
    <Tooltip.Provider>
      <Tooltip.Trigger class={styles.IconButton} handle={demoTooltip} aria-label="Delete">
        <TrashIcon aria-hidden="true" />
      </Tooltip.Trigger>

      <Tooltip.Root handle={demoTooltip}>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={11}>
            <Tooltip.Popup class={styles.Popup}>
              <Tooltip.Arrow class={styles.Arrow} />
              Delete
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function TrashIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-linejoin="round"
      {...props}
      style={{ display: 'block', ...(typeof props.style === 'object' ? props.style : {}) }}
    >
      <path stroke-linecap="square" d="M2.5 4h11" />
      <path stroke-linecap="round" d="M6.5 4V3c0-.82843.67157-1.5 1.5-1.5s1.5.67157 1.5 1.5v1" />
      <path
        stroke-linecap="square"
        d="m3.5 4 .87069 9.1422c.07332.7699.7199 1.3578 1.49324 1.3578h4.27217c.7733 0 1.4199-.5879 1.4932-1.3578L12.5 4"
      />
    </svg>
  );
}
`;export{e as default};