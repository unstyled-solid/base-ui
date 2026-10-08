import { describe, expect, it } from 'vitest';
import { Show } from 'solid-js';
import { createRenderer, describeConformance } from '../../../test';
import { MenuGroup } from './MenuGroup';
import { MenuGroupLabel } from '../group-label/MenuGroupLabel';
import { MenuRadioGroup } from '../radio-group/MenuRadioGroup';
describe('Menu.Group source conformance', () => {
  describeConformance<MenuGroup.State, MenuGroup.Props, HTMLDivElement>(props => <MenuGroup {...props} />, { initialProps: {}, refInstanceof: HTMLDivElement });
});
describe('Menu.RadioGroup source conformance', () => {
  describeConformance<MenuRadioGroup.State, MenuRadioGroup.Props, HTMLDivElement>(props => <MenuRadioGroup {...props} />, { initialProps: {}, refInstanceof: HTMLDivElement });
});
describe('Menu.GroupLabel source conformance', () => {
  describeConformance<MenuGroupLabel.State, MenuGroupLabel.Props, HTMLDivElement>(props => <MenuGroup><MenuGroupLabel {...props} /></MenuGroup>, { initialProps: {}, refInstanceof: HTMLDivElement });
});
describe('Menu group labels', () => {
  const { render, renderProps } = createRenderer();
  it('associates group and hidden label', async () => {
    const view = await render(() => <MenuGroup><MenuGroupLabel id="actions">Actions</MenuGroupLabel><span>Copy</span></MenuGroup>);
    expect(view.getByRole('group')).toHaveAttribute('aria-labelledby', 'actions');
    expect(view.getByText('Actions')).toHaveAttribute('aria-hidden', 'true');
  });
  it('keeps the group host and label identity on live ID updates', async () => {
    const view = await renderProps((props: { id: string }) => <MenuGroup><MenuGroupLabel id={props.id}>Actions</MenuGroupLabel></MenuGroup>, { id: 'before' });
    const group = view.getByRole('group'); const label = view.getByText('Actions');
    await view.setProps({ id: 'after' });
    expect(view.getByRole('group')).toBe(group);
    expect(view.getByText('Actions')).toBe(label);
    expect(group).toHaveAttribute('aria-labelledby', 'after');
  });
  it('stale label cleanup cannot clear a newer label', async () => {
    const view = await renderProps((props: { first: boolean }) => <MenuGroup>
      <Show when={props.first}><MenuGroupLabel id="first">First</MenuGroupLabel></Show>
      <MenuGroupLabel id="second">Second</MenuGroupLabel>
    </MenuGroup>, { first: true });
    expect(view.getByRole('group')).toHaveAttribute('aria-labelledby', 'second');
    await view.setProps({ first: false });
    expect(view.getByRole('group')).toHaveAttribute('aria-labelledby', 'second');
  });
  it('radio groups share the exact label context', async () => {
    const view = await render(() => <MenuRadioGroup disabled><MenuGroupLabel id="choices">Choices</MenuGroupLabel></MenuRadioGroup>);
    expect(view.getByRole('group')).toHaveAttribute('aria-labelledby', 'choices');
    expect(view.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
  });
  it.each(['group', 'radio'] as const)('renders a visible div with group role (%s)', async kind => {
    const view = await render(() => kind === 'group' ? <MenuGroup /> : <MenuRadioGroup />);
    const group = view.getByRole('group');
    expect(group.tagName).toBe('DIV');
    expect(group).toBeVisible();
  });
  it.each(['group', 'radio'] as const)('uses the generated label ID (%s)', async kind => {
    const view = await render(() => kind === 'group'
      ? <MenuGroup><MenuGroupLabel>Generated</MenuGroupLabel></MenuGroup>
      : <MenuRadioGroup><MenuGroupLabel>Generated</MenuGroupLabel></MenuRadioGroup>);
    const label = view.getByText('Generated');
    expect(label.id).not.toBe('');
    expect(view.getByRole('group')).toHaveAttribute('aria-labelledby', label.id);
  });
  it('explicit undefined removes the default aria-hidden', async () => {
    const view = await render(() => <MenuGroup><MenuGroupLabel aria-hidden={undefined}>Visible label</MenuGroupLabel></MenuGroup>);
    expect(view.getByText('Visible label')).not.toHaveAttribute('aria-hidden');
  });
  it('registers a newer label before disposing the older label', async () => {
    const view = await renderProps((props: { labels: 'old' | 'both' | 'new' }) => <MenuGroup>
      <Show when={props.labels !== 'new'}><MenuGroupLabel id="old-label">Old</MenuGroupLabel></Show>
      <Show when={props.labels !== 'old'}><MenuGroupLabel id="new-label">New</MenuGroupLabel></Show>
    </MenuGroup>, { labels: 'old' });
    const group = view.getByRole('group');
    expect(group).toHaveAttribute('aria-labelledby', 'old-label');
    await view.setProps({ labels: 'both' });
    expect(group).toHaveAttribute('aria-labelledby', 'new-label');
    await view.setProps({ labels: 'new' });
    expect(group).toHaveAttribute('aria-labelledby', 'new-label');
  });
});
