var e=`import { createSignal, createUniqueId, onCleanup } from 'solid-js';
import { Button } from 'baseui-solid2/button';
import styles from './index.module.css';

export default function ExampleButton() {
  const [loading, setLoading] = createSignal(false);
  const labelId = createUniqueId();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timeout));

  return (
    <Button
      class={styles.Button}
      disabled={loading()}
      focusableWhenDisabled
      aria-labelledby={labelId}
      onClick={() => {
        setLoading(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setLoading(false);
        }, 4000);
      }}
    >
      <span id={labelId}>{loading() ? 'Submitting' : 'Submit'}</span>
    </Button>
  );
}
`;export{e as default};