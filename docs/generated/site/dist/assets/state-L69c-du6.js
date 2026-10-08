var e=`import { createSignal, onCleanup } from 'solid-js';
import styles from './style.module.css';

export const lifecycle = { setups: 0, cleanups: 0, events: 0 };
export default function Stateful() {
  const [count, setCount] = createSignal(0);
  lifecycle.setups++;
  const listener = () => { lifecycle.events++; };
  document.addEventListener('fixture-event', listener);
  onCleanup(() => {
    document.removeEventListener('fixture-event', listener);
    lifecycle.cleanups++;
  });
  return <button class={styles.Fixture} onClick={() => setCount(n => n + 1)}>Count {count()}</button>;
}
`;export{e as default};