var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Switch } from 'baseui-solid2/switch';
import styles from './index.module.css';

export default function ExampleSwitch() {
  return (
    <label class={styles.Label}>
      <Switch.Root defaultChecked class={styles.Switch}>
        <Switch.Thumb class={styles.Thumb} />
      </Switch.Root>
      Notifications
    </label>
  );
}
`;export{e as default};