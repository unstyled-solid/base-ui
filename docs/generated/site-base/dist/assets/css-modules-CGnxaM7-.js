var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { ScrollArea } from 'baseui-solid2/scroll-area';
import styles from './index.module.css';

export default function ExampleScrollAreaBoth() {
  return (
    <ScrollArea.Root class={styles.ScrollArea}>
      <ScrollArea.Viewport class={styles.Viewport}>
        <ScrollArea.Content class={styles.Content}>
          <ul class={styles.Grid}>
            {Array.from({ length: 100 }, (_, i) => (
              <li  class={styles.Item}>
                {i + 1}
              </li>
            ))}
          </ul>
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar class={styles.Scrollbar}>
        <ScrollArea.Thumb class={styles.Thumb} />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar class={styles.Scrollbar} orientation="horizontal">
        <ScrollArea.Thumb class={styles.Thumb} />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}
`;export{e as default};