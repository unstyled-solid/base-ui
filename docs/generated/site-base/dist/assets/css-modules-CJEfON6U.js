var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { AlertDialog } from 'baseui-solid2/alert-dialog';
import styles from './index.module.css';

export default function ExampleAlertDialog() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger data-color="red" class={styles.Button}>
        Discard draft
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop class={styles.Backdrop} />
        <AlertDialog.Popup class={styles.Popup}>
          <div class={styles.Intro}>
            <AlertDialog.Title class={styles.Title}>Discard draft?</AlertDialog.Title>
            <AlertDialog.Description class={styles.Description}>
              You can't undo this action.
            </AlertDialog.Description>
          </div>
          <div class={styles.Actions}>
            <AlertDialog.Close class={styles.Button}>Cancel</AlertDialog.Close>
            <AlertDialog.Close data-color="red" class={styles.Button}>
              Discard
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
`;export{e as default};