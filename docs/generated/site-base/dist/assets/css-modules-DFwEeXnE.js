var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Separator } from 'baseui-solid2/separator';
import styles from './index.module.css';

export default function ExampleSeparator() {
  return (
    <div class={styles.Container}>
      <a href="#" class={styles.Link}>
        Home
      </a>
      <a href="#" class={styles.Link}>
        Pricing
      </a>
      <a href="#" class={styles.Link}>
        Blog
      </a>
      <a href="#" class={styles.Link}>
        Support
      </a>

      <Separator orientation="vertical" class={styles.Separator} />

      <a href="#" class={styles.Link}>
        Log in
      </a>
      <a href="#" class={styles.Link}>
        Sign up
      </a>
    </div>
  );
}
`;export{e as default};