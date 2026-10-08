import { expect, it } from 'vitest';
import { createRenderer } from '../../../test';
import { createFieldFocusScope, createSetFieldFocused } from './createSetFieldFocused';

it.each([true, false])('standalone focus scopes (explicit=%s) do not let old sibling cleanup clear current sibling', async (explicit) => {
  const values: boolean[] = [];
  const scope = createFieldFocusScope();
  const publish = (value: boolean) => values.push(value);
  function Control(props: { name: string }) {
    let node: HTMLButtonElement | null = null;
    const set = createSetFieldFocused(() => false, () => node, publish, explicit ? scope : undefined);
    return <button ref={(element) => { node = element; }} onFocus={() => set(true)} onBlur={() => set(false)}>{props.name}</button>;
  }
  const view = await createRenderer().renderProps((props: { first: boolean }) => <>{props.first && <Control name="First" />}<Control name="Second" /></>, { first: true });
  view.getByRole('button', { name: 'First' }).focus();
  view.getByRole('button', { name: 'Second' }).focus();
  values.length = 0;
  await view.setProps({ first: false });
  expect(values).toEqual([]); expect(view.getByRole('button', { name: 'Second' })).toHaveFocus();
  view.unmount(); expect(values).toEqual([false]);
});
