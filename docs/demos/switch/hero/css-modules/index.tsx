import { Switch } from 'baseui-solid2/switch';
import styles from './index.module.css';

export default function ExampleSwitch() {
  return (
    <label class={styles.Label}>
      <Switch.Root defaultChecked class={styles.Switch}>
        <Switch.Thumb class={styles.Thumb} />
      </Switch.Root>
      Notifications
    </label>
  );
}
