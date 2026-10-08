var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { AlertDialog } from 'baseui-solid2/alert-dialog';
import styles from '../../_index.module.css';



export default function AlertDialogDetachedTriggersSimpleDemo() {
const demoAlertDialog = AlertDialog.createHandle();

  return (
    <>
      <AlertDialog.Trigger
        class={\`\${styles.Button} \${styles.DangerButton}\`}
        handle={demoAlertDialog}
      >
        Discard draft
      </AlertDialog.Trigger>

      <AlertDialog.Root handle={demoAlertDialog}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop class={styles.Backdrop} />
          <AlertDialog.Popup class={styles.Popup}>
            <div class={styles.Intro}>
              <AlertDialog.Title class={styles.Title}>Discard draft?</AlertDialog.Title>
              <AlertDialog.Description class={styles.Description}>
                This action cannot be undone.
              </AlertDialog.Description>
            </div>
            <div class={styles.Actions}>
              <AlertDialog.Close class={styles.Button}>Cancel</AlertDialog.Close>
              <AlertDialog.Close class={\`\${styles.Button} \${styles.DangerButton}\`}>
                Discard
              </AlertDialog.Close>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
`;export{e as default};