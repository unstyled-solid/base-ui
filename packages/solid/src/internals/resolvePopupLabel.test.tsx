import { expect, it } from 'vitest';
import { createRenderer } from '../../test';
import { createPopupLabel, resolvePopupLabel } from './resolvePopupLabel';
import { createRenderElement } from './createRenderElement';

it('falls back to the trigger id', () => {
  expect(resolvePopupLabel({}, null, 'trigger')).toBe('trigger');
});

it('popup labels use actual trigger IDs and callback-authored live labels without stale fallback precedence', async () => {
  const trigger = document.createElement('button'); trigger.id = 'actual-trigger';
  expect(resolvePopupLabel({}, trigger, 'registered-trigger')).toBe('actual-trigger');
  expect(resolvePopupLabel({ 'aria-label': 'Commands' }, trigger, null)).toBeUndefined();
  const view = await createRenderer().renderProps((props: { label: string | undefined }) => {
    const label = createPopupLabel({}, () => trigger, () => 'registered-trigger');
    return createRenderElement<{}, HTMLElement>('div', { render: (attributes) => <section {...attributes} aria-label={props.label} /> }, {
      props: [{ role: 'menu' }, label.props], ref: label.ref,
    });
  }, { label: 'Commands' });
  const popup = view.getByRole('menu');
  expect(popup).toHaveAccessibleName('Commands'); expect(popup).not.toHaveAttribute('aria-labelledby');
  await view.setProps({ label: 'Changed' }); expect(popup).toHaveAccessibleName('Changed');
  await view.setProps({ label: undefined }); expect(popup).toHaveAttribute('aria-labelledby', 'actual-trigger');
  expect(view.getByRole('menu')).toBe(popup);
});
