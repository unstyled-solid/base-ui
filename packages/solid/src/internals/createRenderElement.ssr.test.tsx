import { expect, it, vi } from 'vitest';
import { renderToString } from '@solidjs/web';
import { createRenderElement } from './createRenderElement';
import { createButton } from './use-button/useButton';
import { createUniqueId } from 'solid-js';
import { propStageParts, readStageProps } from './propStages.fixture';

it('button prop reads do not consume server hydration keys', () => {
  function Fixture(props: { reads: number }) {
    const { getButtonProps } = createButton();
    return createRenderElement('button', {
      render(buttonProps) {
        for (let index = 0; index < props.reads; index += 1) {
          Object.keys(buttonProps);
          void buttonProps.type;
          void buttonProps.disabled;
          void buttonProps.tabindex;
        }
        return <button {...buttonProps}>Read props</button>;
      },
    }, { props: [getButtonProps] });
  }
  const key = (reads: number) => {
    const html = renderToString(() => <Fixture reads={reads} />, { renderId: 'button-reads' });
    const match = html.match(/<button[^>]*_hk="?([^"\s>]+)/);
    expect(match, html).not.toBeNull();
    return match![1];
  };
  expect(key(1)).toBe(key(0));
  expect(key(20)).toBe(key(0));
});

it('server disabled rendering evaluates neither the host nor its children or prop getter', () => {
  const render = vi.fn(() => <div>hidden-host</div>), children = vi.fn(() => 'hidden-content');
  const getter = vi.fn(() => ({ get children() { return children(); } }));
  const html = renderToString(() => createRenderElement('div', { render }, { enabled: false, props: [getter] }));
  expect(html).not.toContain('hidden-host'); expect(html).not.toContain('hidden-content');
  expect(render).not.toHaveBeenCalled(); expect(getter).not.toHaveBeenCalled(); expect(children).not.toHaveBeenCalled();
});

for (const [name, Part] of Object.entries(propStageParts)) {
  it(`${name}: repeated server prop reads preserve complete markup and the next owner ID`, () => {
    function Fixture(props: { reads: number }) {
      return Part((hostProps) => {
        const before = createUniqueId();
        readStageProps(hostProps, props.reads);
        const after = createUniqueId();
        // Both sentinels are emitted so allocation cannot be hidden by a native
        // host claiming its key before spread evaluation. Keep all markup exact.
        return name === 'FieldControl'
          ? <input {...hostProps} data-before={before} data-after={after} />
          : <div {...hostProps} data-before={before} data-after={after} />;
      });
    }
    const render = (reads: number) => renderToString(() => <Fixture reads={reads} />, { renderId: `pure-${name}` });
    const baseline = render(0);
    expect(render(2)).toBe(baseline);
    expect(render(20)).toBe(baseline);
  });
}
