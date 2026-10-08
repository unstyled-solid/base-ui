var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Button } from 'baseui-solid2/button';
import styles from './index.module.css';

export default function ExampleButton() {
  const [loading, setLoading] = createSignal(false);
  const labelId = createUniqueId();

  return (
    <Button
      class={styles.Button}
      disabled={loading()}
      focusableWhenDisabled
      aria-labelledby={labelId}
      onClick={() => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
        }, 4000);
      }}
    >
      <span id={labelId}>{loading() ? 'Submitting' : 'Submit'}</span>
    </Button>
  );
}
`;export{e as default};