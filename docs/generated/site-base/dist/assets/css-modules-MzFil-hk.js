var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Meter } from 'baseui-solid2/meter';
import styles from './index.module.css';

export default function ExampleMeter() {
  return (
    <Meter.Root class={styles.Meter} value={24}>
      <Meter.Label class={styles.Label}>Storage Used</Meter.Label>
      <Meter.Value class={styles.Value} />
      <Meter.Track class={styles.Track}>
        <Meter.Indicator class={styles.Indicator} />
      </Meter.Track>
    </Meter.Root>
  );
}
`;export{e as default};