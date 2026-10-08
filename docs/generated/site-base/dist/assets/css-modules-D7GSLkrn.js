var e=`import { Dialog } from 'baseui-solid2/dialog';
import { Field } from 'baseui-solid2/field';
import { Fieldset } from 'baseui-solid2/fieldset';
import styles from './index.module.css';

export default function ExampleDialog() {
  let initialFocusRef: HTMLInputElement | null = null;
  let finalFocusRef: HTMLButtonElement | null = null;

  return (
    <div class={styles.Container}>
      <Dialog.Root>
        <Dialog.Trigger class={styles.Button}>Open feedback</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop class={styles.Backdrop} />
          <Dialog.Popup
            class={styles.Popup}
            initialFocus={() => initialFocusRef}
            finalFocus={() => finalFocusRef}
          >
            <div class={styles.Intro}>
              <Dialog.Title class={styles.Title}>Feedback form</Dialog.Title>
              <Dialog.Description class={styles.Description}>
                Your feedback means a lot to us.
              </Dialog.Description>
            </div>
            <Fieldset.Root class={styles.Fieldset}>
              <Field.Root class={styles.Field}>
                <Field.Label class={styles.Label}>Full name</Field.Label>
                <Field.Control placeholder="Enter your name" class={styles.Input} />
              </Field.Root>
              <Field.Root class={styles.Field}>
                <Field.Label class={styles.Label}>Feedback</Field.Label>
                <Field.Control
                  ref={(element) => { initialFocusRef = element; }}
                  required
                  placeholder="Enter your feedback"
                  class={styles.Input}
                />
              </Field.Root>
            </Fieldset.Root>
            <div class={styles.Actions}>
              <Dialog.Close class={styles.Button}>Close</Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <button ref={(element) => { finalFocusRef = element; }} type="button" class={styles.Button}>
        Final focus
      </button>
    </div>
  );
}
`;export{e as default};