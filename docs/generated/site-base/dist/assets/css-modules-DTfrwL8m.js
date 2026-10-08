var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Popover } from 'baseui-solid2/popover';
import styles from '../../_index.module.css';



export default function PopoverDetachedTriggersSimpleDemo() {
const demoPopover = Popover.createHandle();

  return (
    <>
      <Popover.Trigger class={styles.Button} handle={demoPopover}>
        Notifications
      </Popover.Trigger>

      <Popover.Root handle={demoPopover}>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup class={styles.Popup}>
              <Popover.Arrow class={styles.Arrow} />
              <Popover.Title class={styles.Title}>Notifications</Popover.Title>
              <Popover.Description class={styles.Description}>
                You are all caught up. Good job!
              </Popover.Description>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
`;export{e as default};