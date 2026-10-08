var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { OTPField } from 'baseui-solid2/otp-field';
import styles from './index.module.css';

const OTP_LENGTH = 6;

export default function OTPFieldGroupedDemo() {
  const id = createUniqueId();

  return (
    <div class={styles.Field}>
      <label for={id} class={styles.Label}>
        Verification code
      </label>
      <OTPField.Root id={id} length={OTP_LENGTH} class={styles.Root}>
        <div class={styles.Group}>
          {Array.from({ length: 3 }, (_, index) => (
            <OTPField.Input
              
              class={styles.Input}
              aria-label={index === 0 ? undefined : \`Character \${index + 1} of \${OTP_LENGTH}\`}
            />
          ))}
        </div>
        <OTPField.Separator class={styles.Separator} />
        <div class={styles.Group}>
          {Array.from({ length: 3 }, (_, index) => (
            <OTPField.Input
              
              class={styles.Input}
              aria-label={\`Character \${index + 4} of \${OTP_LENGTH}\`}
            />
          ))}
        </div>
      </OTPField.Root>
    </div>
  );
}
`;export{e as default};