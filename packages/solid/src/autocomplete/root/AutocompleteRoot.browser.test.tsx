import { expect } from 'vitest';
import { browserCase, createRenderer, waitFor } from '../../../test';
import { Autocomplete } from '../index';
import { AutocompleteFixture } from '../test/AutocompleteFixture';

const source = 'packages/react/src/autocomplete/root/AutocompleteRoot.test.tsx';
const metadata = { source, environment: 'browser' as const, issue: 'bsolid-browser' };
const { render } = createRenderer();

for (const mode of ['inline', 'both'] as const) {
  browserCase({ ...metadata, case: `mode="${mode}": keyboard completion appends at the caret without replacing either input host` }, async () => {
    // Canonical mode cases retain the typed query during completion and append
    // to the completed label; they do not select a suffix for replacement.
    const view = await render(() => <AutocompleteFixture mode={mode}
      items={['apple', 'banana', 'cherry']} />);
    const input = view.getByTestId<HTMLInputElement>('input');
    const hidden = view.container.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;
    expect(hidden).not.toBeNull();
    await view.user.type(input, 'a');
    expect(view.getAllByRole('option')).toHaveLength(mode === 'both' ? 2 : 3);
    await view.user.keyboard('{ArrowDown}');
    await waitFor(() => expect(input.value).toBe('apple'));
    expect(view.getAllByRole('option')).toHaveLength(mode === 'both' ? 2 : 3);
    expect(input.selectionStart).toBe(5);
    expect(input.selectionEnd).toBe(5);
    expect(input.ownerDocument.activeElement).toBe(input);
    expect(view.getByTestId('input')).toBe(input);
    expect(view.container.querySelector('input[aria-hidden="true"]')).toBe(hidden);

    await view.user.keyboard('b');
    await waitFor(() => expect(input.value).toBe('appleb'));
    expect(input.selectionStart).toBe(6);
    expect(input.selectionEnd).toBe(6);
    expect(input.ownerDocument.activeElement).toBe(input);
    expect(view.getByTestId('input')).toBe(input);
    expect(view.container.querySelector('input[aria-hidden="true"]')).toBe(hidden);
    expect(hidden.value).toBe('appleb');
    if (mode === 'inline') expect(view.getAllByRole('option')).toHaveLength(3);
  });
}

browserCase({ ...metadata, case: 'native mid-string editing preserves the caret and original visible and hidden controls' }, async () => {
  const view = await render(() => <Autocomplete.Root defaultValue="abcdef">
    <Autocomplete.Input data-testid="input" />
  </Autocomplete.Root>);
  const input = view.getByTestId<HTMLInputElement>('input');
  const hidden = view.container.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;
  expect(hidden).not.toBeNull();
  await view.user.click(input);
  await view.user.keyboard('{Home}{ArrowRight}{ArrowRight}X');
  await waitFor(() => expect(input.value).toBe('abXcdef'));
  expect(input.selectionStart).toBe(3);
  expect(input.selectionEnd).toBe(3);
  expect(input.ownerDocument.activeElement).toBe(input);
  expect(view.getByTestId('input')).toBe(input);
  expect(view.container.querySelector('input[aria-hidden="true"]')).toBe(hidden);
  expect(hidden.value).toBe('abXcdef');
});

browserCase({ ...metadata, case: 'resets the list scroll position to the top when typing' }, async () => {
  const items = Array.from({ length: 50 }, (_, i) => i < 25 ? `alpha-${i}` : `beta-${i - 25}`);
  const view = await render(() => <AutocompleteFixture items={items} openOnInputClick
    listStyle={{ 'max-height': '100px', 'overflow-y': 'auto' }} />);
  const input = view.getByTestId('input');
  await view.user.click(input);
  const list = view.getByRole('listbox');
  list.scrollTop = 40;
  expect(list.scrollTop).toBeGreaterThan(0);
  await view.user.type(input, 'b');
  await waitFor(() => expect(list.scrollTop).toBe(0));
});

browserCase({ ...metadata, case: 'mode="both": inline navigation does not reset the scroll to the top' }, async () => {
  const view = await render(() => <AutocompleteFixture mode="both"
    items={Array.from({ length: 50 }, (_, i) => `item-${i}`)}
    listStyle={{ 'max-height': '100px', 'overflow-y': 'auto' }} />);
  const input = view.getByTestId<HTMLInputElement>('input');
  await view.user.type(input, 'item');
  for (let i = 0; i < 20; i++) await view.user.keyboard('{ArrowDown}');
  await waitFor(() => expect(view.getByRole('listbox').scrollTop).toBeGreaterThan(0));
  expect(input.value).toMatch(/^item-/);
  // Source appends text at the completion's caret; it does not replace a selected suffix.
  expect(input.selectionStart).toBe(input.value.length);
  expect(input.selectionEnd).toBe(input.value.length);
});

browserCase({ ...metadata, case: 'submits to an external form when form is provided' }, async () => {
  let submitted: FormDataEntryValue[] | undefined;
  const view = await render(() => <><form id="external" onSubmit={(event) => {
    event.preventDefault(); submitted = new FormData(event.currentTarget).getAll('q');
  }}><button type="submit">Submit</button></form>
    <Autocomplete.Root name="q" form="external"><Autocomplete.Input /></Autocomplete.Root>
  </>);
  await view.user.type(view.getByRole('combobox'), 'base ui');
  await view.user.click(view.getByText('Submit'));
  expect(submitted).toEqual(['base ui']);
});

browserCase({ ...metadata, case: 'submitOnItemClick pointer submits the associated external form' }, async () => {
  let submitted: FormDataEntryValue[] | undefined;
  let count = 0;
  const view = await render(() => <><form id="external" onSubmit={(event) => {
    event.preventDefault(); submitted = new FormData(event.currentTarget).getAll('q'); count++;
  }} /><AutocompleteFixture name="q" form="external" submitOnItemClick /></>);
  await view.user.type(view.getByTestId('input'), 'al');
  await view.user.click(view.getByRole('option', { name: 'alpha' }));
  expect(submitted).toEqual(['alpha']);
  expect(count).toBe(1);
});
