var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Progress } from 'baseui-solid2/progress';
import styles from './index.module.css';

export default function ExampleProgress() {
  const [value, setValue] = createSignal(20);

  // Simulate changes
  onSettled(() => {
    const interval = setInterval(() => {
      setValue((current) => Math.min(100, Math.round(current + Math.random() * 25)));
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <Progress.Root class={styles.Progress} value={value()}>
      <Progress.Label class={styles.Label}>Export data</Progress.Label>
      <Progress.Value class={styles.Value} />
      <Progress.Track class={styles.Track}>
        <Progress.Indicator class={styles.Indicator} />
      </Progress.Track>
    </Progress.Root>
  );
}
`;export{e as default};