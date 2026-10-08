var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { OTPField } from 'baseui-solid2/otp-field';
import styles from './index.module.css';

const CODE_LENGTH = 6;

export default function OTPFieldFocusedPlaceholderDemo() {
  const id = createUniqueId();
  const descriptionId = \`\${id}-description\`;

  return (
    <div class={styles.Field}>
      <label for={id} class={styles.Label}>
        Verification code
      </label>
      <OTPField.Root
        id={id}
        length={CODE_LENGTH}
        aria-describedby={descriptionId}
        class={styles.Root}
      >
        {Array.from({ length: CODE_LENGTH }, (_, index) => (
          <OTPField.Input
            
            class={styles.Input}
            placeholder="•"
            aria-label={index === 0 ? undefined : \`Character \${index + 1} of \${CODE_LENGTH}\`}
          />
        ))}
      </OTPField.Root>
      <p id={descriptionId} class={styles.Description}>
        Placeholder hints can stay visible until the active slot is focused.
      </p>
    </div>
  );
}
`;export{e as default};