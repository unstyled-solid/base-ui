import { expect, vi } from 'vitest';
import { browserCase, createRenderer, fireEvent, screen, waitFor } from '../../../test';
import { Select } from '../index';
import type { SelectRootProps } from './SelectRoot';

const { render, renderProps } = createRenderer();
const source = 'packages/react/src/select/root/SelectRoot.test.tsx';
const issue = 'bsolid-browser-differential-replay';

function Fixture(props: SelectRootProps<string>) {
  return <form data-testid="form"><Select.Root name="choice" {...props}>
    <Select.Trigger><Select.Value /></Select.Trigger>
    <Select.Portal><Select.Positioner alignItemWithTrigger={false}>
      <Select.Popup><Select.Item value="a">a</Select.Item><Select.Item value="b">b</Select.Item></Select.Popup>
    </Select.Positioner></Select.Portal>
  </Select.Root></form>;
}

function input() { return screen.getByRole<HTMLInputElement>('textbox', { hidden: true }); }
function projection(value: string) {
  expect(input()).toHaveAttribute('value', value);
  expect(input().defaultValue).toBe(value);
  expect(input().value).toBe(value);
  expect(new FormData(screen.getByTestId('form') as HTMLFormElement).get('choice')).toBe(value);
}

browserCase({ source, case: 'should call onValueChange when an item is selected: DOM value attribute and native form projection', environment: 'browser', issue }, async () => {
  const view = await render(() => <Fixture defaultValue="a" />);
  const control = input();
  projection('a');
  await view.user.click(screen.getByRole('combobox'));
  await screen.findByRole('listbox');
  projection('a');
  await view.user.click(screen.getByRole('option', { name: 'b' }));
  await waitFor(() => expect(input()).toHaveAttribute('value', 'b'));
  expect(input()).toBe(control);
  projection('b');
});

browserCase({ source, case: 'controlled value: dirty native input, rejected request and live prop replacement retain the attribute', environment: 'browser', issue }, async () => {
  const changed = vi.fn();
  const initialProps: SelectRootProps<string> = { value: 'a', onValueChange: changed };
  const view = await renderProps(Fixture, initialProps);
  const control = input();
  projection('a');
  fireEvent.input(control, { target: { value: 'b' } });
  await waitFor(() => expect(changed).toHaveBeenCalledOnce());
  expect(changed.mock.calls[0][0]).toBe('b');
  projection('a');
  await view.setProps({ value: 'b' });
  expect(input()).toBe(control);
  projection('b');
  await view.setProps({ value: null });
  projection('');
});

browserCase({ source, case: 'does not update field state when autofill is canceled: value attribute remains the accepted projection', environment: 'browser', issue }, async () => {
  const changed = vi.fn((_value, details) => details.cancel());
  await render(() => <Fixture defaultValue="a" onValueChange={changed} />);
  fireEvent.input(input(), { target: { value: 'b' } });
  await waitFor(() => expect(changed).toHaveBeenCalledOnce());
  projection('a');
});
