var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Slider } from 'baseui-solid2/slider';
import styles from './index.module.css';

const MIN = 0;
const MAX = 100;
const MARKS = [0, 25, 50, 75, 100];

export default function MarksSlider() {
  return (
    <Slider.Root class={styles.Root} defaultValue={40} min={MIN} max={MAX}>
      <Slider.Control class={styles.Control}>
        <Slider.Track class={styles.Track}>
          <Slider.Indicator class={styles.Indicator} />
          {MARKS.map((mark) => (
            <div
              
              aria-hidden="true"
              class={styles.Mark}
              style={{ left: \`\${valueToPercent(mark)}%\` }}
            />
          ))}
          <Slider.Thumb aria-label="Volume" class={styles.Thumb} />
        </Slider.Track>
      </Slider.Control>
      <div class={styles.MarkLabels} aria-hidden="true">
        {MARKS.map((mark) => (
          <span
            
            class={styles.MarkLabel}
            style={{ left: \`\${valueToPercent(mark)}%\` }}
          >
            {mark}
          </span>
        ))}
      </div>
    </Slider.Root>
  );
}

function valueToPercent(value: number) {
  return ((value - MIN) / (MAX - MIN)) * 100;
}
`;export{e as default};