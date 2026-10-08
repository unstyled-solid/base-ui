import { describe, expect, it, vi } from 'vitest';
import { renderToString } from '@solidjs/web';
import { Fieldset } from '../index';

// Pinned FieldsetLegend.test.tsx server assertions; hydration replay: bsolid-hydration.
describe('Fieldset.Legend SSR', () => {
  it('does not set aria-labelledby when the legend is absent', () => {
    const html = renderToString(() => <Fieldset.Root />);
    expect(html).toContain('<fieldset');
    expect(html).not.toContain('aria-labelledby');
  });

  it('generates a legend ID but defers registration until client effects', () => {
    const html = renderToString(() => <Fieldset.Root><Fieldset.Legend>Legend</Fieldset.Legend></Fieldset.Root>);
    expect(html).toMatch(/<div[^>]*id="[^"]+"/);
    expect(html).toContain('Legend');
    expect(html).not.toContain('aria-labelledby');
  });

  it('does not run refs or label registration during repeated server requests', () => {
    const rootRef = vi.fn();
    const legendRef = vi.fn();
    for (const id of ['request-a', 'request-b']) {
      const html = renderToString(() => (
        <Fieldset.Root ref={rootRef}>
          <Fieldset.Legend id={id} ref={legendRef}>Legend</Fieldset.Legend>
        </Fieldset.Root>
      ));
      expect(html).toContain(`id="${id}"`);
      expect(html).not.toContain('aria-labelledby');
    }
    expect(rootRef).not.toHaveBeenCalled();
    expect(legendRef).not.toHaveBeenCalled();
  });

  it('renders nested ancestor-disabled state and consumer ARIA without client effects', () => {
    const html = renderToString(() => (
      <Fieldset.Root disabled>
        <Fieldset.Root disabled={false} aria-labelledby="external">
          <Fieldset.Legend id="inner-label" class={(state) => state.disabled ? 'disabled' : 'enabled'}>Legend</Fieldset.Legend>
        </Fieldset.Root>
      </Fieldset.Root>
    ));
    expect(html.match(/<fieldset[^>]* disabled(?:[\s>]|="")/g)).toHaveLength(2);
    expect(html).toContain('aria-labelledby="external"');
    expect(html).toContain('class="disabled"');
    expect(html).not.toContain('aria-labelledby="inner-label"');
  });
});
