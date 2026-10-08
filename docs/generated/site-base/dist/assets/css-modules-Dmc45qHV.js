var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { ContextMenu } from 'baseui-solid2/context-menu';
import styles from './index.module.css';

export default function ExampleMenu() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger class={styles.Trigger}>Right click here</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner class={styles.Positioner}>
          <ContextMenu.Popup class={styles.Popup}>
            <ContextMenu.Item class={styles.Item}>Add to Library</ContextMenu.Item>
            <ContextMenu.Item class={styles.Item}>Add to Playlist</ContextMenu.Item>
            <ContextMenu.Separator class={styles.Separator} />
            <ContextMenu.Item class={styles.Item}>Play Next</ContextMenu.Item>
            <ContextMenu.Item class={styles.Item}>Play Last</ContextMenu.Item>
            <ContextMenu.Separator class={styles.Separator} />
            <ContextMenu.Item class={styles.Item}>Favorite</ContextMenu.Item>
            <ContextMenu.Item class={styles.Item}>Share</ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
`;export{e as default};