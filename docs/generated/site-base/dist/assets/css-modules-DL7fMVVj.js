var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal } from 'solid-js';
import { useRender } from 'baseui-solid2/use-render';
import { mergeProps } from 'baseui-solid2/merge-props';
import styles from './index.module.css';
interface CounterState { odd: boolean }
interface CounterProps extends useRender.ComponentProps<'button', CounterState> {}
function Counter(props: CounterProps) {
  const [count, setCount] = createSignal(0);
  const state = { get odd() { return count() % 2 === 1; } };
  return useRender({
    defaultTagName: 'button',
    get render() { return props.render; },
    state,
    props: () => mergeProps<'button'>({
      class: styles.Button,
      type: 'button',
      get children() { return <>Counter: <span class={styles.count}>{count()}</span></>; },
      onClick() { setCount(value => value + 1); },
      'aria-label': \`Count is \${count()}, click to increase.\`,
    }, props),
  });
}
export default function ExampleCounter() {
  return <Counter render={(props, state) => <button {...props}>
    {props.children}<span class={styles.suffix}>{state.odd ? '👎' : '👍'}</span>
  </button>} />;
}
`;export{e as default};