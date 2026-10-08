import type { JSX } from '@solidjs/web';
import { createSignal, flush } from 'solid-js';
import { describe, expect, it } from 'vitest';
import { createRenderer } from '../../test/createRenderer';
import { resolveMultipleLabels, resolveSelectedLabel } from './resolveValueLabel';

describe('resolveValueLabel Solid JSX contracts', () => {
  const { render } = createRenderer();
  it('retains label nodes, nested arrays, reactive fragments and exact separators across updates', async () => {
    let update!: (value: string) => void;
    let original!: JSX.Element;
    const view = await render(() => {
      const [text, setText] = createSignal('Before');
      update = setText;
      original = <strong>{text()}</strong>;
      const labels = { a: original, b: [<em>Second</em>, ' tail'], c: <>{text()}</> };
      expect(resolveSelectedLabel('a', labels)).toBe(original);
      const result: JSX.Element = resolveMultipleLabels(['a', 'b', 'c'], labels);
      return <div data-testid="labels">{result}</div>;
    });
    const host = view.getByTestId('labels');
    const strong = host.querySelector('strong');
    expect(host.textContent).toBe('Before, Second tail, Before');
    update('After');
    flush(); // Intentional synchronous observation of the staged signal update.
    expect(host.querySelector('strong')).toBe(strong);
    expect(host.textContent).toBe('After, Second tail, After');
  });
  it('renders falsy labels without dropping separators', async () => {
    const view = await render(() => <div data-testid="labels">{
      resolveMultipleLabels(['a', 'b', 'c'], { a: false, b: 0, c: <span>End</span> })
    }</div>);
    expect(view.getByTestId('labels').textContent).toBe(', 0, End');
  });
});
