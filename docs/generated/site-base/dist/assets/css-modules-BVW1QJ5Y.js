var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { DirectionProvider } from 'baseui-solid2/direction-provider';
import { Slider } from 'baseui-solid2/slider';
import styles from './index.module.css';

export default function ExampleDirectionProvider() {
  return (
    <div dir="rtl">
      <DirectionProvider direction="rtl">
        <Slider.Root defaultValue={25}>
          <Slider.Control class={styles.Control}>
            <Slider.Track class={styles.Track}>
              <Slider.Indicator class={styles.Indicator} />
              <Slider.Thumb aria-label="Volume" class={styles.Thumb} />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
      </DirectionProvider>
    </div>
  );
}
`;export{e as default};