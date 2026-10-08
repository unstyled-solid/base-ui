import { createSignal } from 'solid-js';
import './HTTPAsset.fixture.css';

export default function HTTPLazyPart(props: { label: string }) {
  const [count, setCount] = createSignal(0);
  return <section><button onClick={() => setCount(value => value + 1)}>{props.label}</button><output class="http-lazy-output">{count()}</output></section>;
}
