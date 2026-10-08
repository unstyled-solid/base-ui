import { expect } from 'vitest';
import { browserCase, createRenderer, fetchSSRFixture, hydrateSSRFixture, mountSSRFixtureHTML, waitFor, within } from '../../../test';
import { Fieldset } from '../index';
import { FieldsetLegendHydrationFixture } from '../legend/FieldsetLegend.hydration.fixture';

browserCase({ source: 'packages/react/src/fieldset/root/FieldsetRoot.test.tsx', case: 'native disabled prevents focus; label changes preserve focus and selection', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const { renderProps } = createRenderer();
  const view = await renderProps((props: { disabled: boolean; id: string }) => (
    <Fieldset.Root disabled={props.disabled}>
      <Fieldset.Legend id={props.id}>Legend</Fieldset.Legend>
      <input data-testid="control" />
    </Fieldset.Root>
  ), { disabled: true, id: 'before' });
  const input = view.getByTestId('control') as HTMLInputElement;
  input.focus();
  expect(document.activeElement).not.toBe(input);
  await view.setProps({ disabled: false });
  input.value = 'selection';
  input.focus();
  input.setSelectionRange(1, 4);
  await view.setProps({ id: 'after' });
  expect(document.activeElement).toBe(input);
  expect(input.selectionStart).toBe(1);
  expect(input.selectionEnd).toBe(4);
  expect(view.getByRole('group')).toHaveAttribute('aria-labelledby', 'after');
});

browserCase({ source: 'packages/react/src/fieldset/legend/FieldsetLegend.test.tsx', case: 'sets aria-labelledby after hydration without a custom legend id', environment: 'browser', issue: 'bsolid-hydration' }, async () => {
  const renderId = 'fieldset-legend-source';
  const html = await fetchSSRFixture({
    module: '/packages/solid/src/fieldset/legend/FieldsetLegend.hydration.fixture.tsx',
    exportName: 'FieldsetLegendHydrationFixture', renderId,
  });
  const mounted = mountSSRFixtureHTML(html);
  const screen = within(mounted.root);
  const fieldset = screen.getByTestId('fieldset');
  const legend = screen.getByTestId('legend');
  const id = legend.id;
  let dispose: (() => void) | undefined;
  try {
    expect(id).not.toBe('');
    expect(fieldset).not.toHaveAttribute('aria-labelledby');
    dispose = hydrateSSRFixture(FieldsetLegendHydrationFixture, {}, mounted.root, renderId);
    await waitFor(() => expect(screen.getByTestId('fieldset')).toHaveAttribute('aria-labelledby', id));
    expect(screen.getByTestId('fieldset')).toBe(fieldset);
    expect(screen.getByTestId('legend')).toBe(legend);
    expect(legend.id).toBe(id);
  } finally {
    if (dispose) await waitFor(() => expect(globalThis._$HY).toHaveProperty('done', true));
    dispose?.(); mounted.root.remove(); mounted.restoreHydration();
  }
});
