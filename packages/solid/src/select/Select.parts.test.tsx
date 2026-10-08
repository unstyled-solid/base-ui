import { describe, expect, it } from 'vitest';
import { createSignal } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderer, describeConformance, screen } from '../../test';
import { Select } from './index';

// Each factory executes the part under its real family owners. No foundation mocks.
type Props = Record<string, any>;
// Conformance queries are intentionally container-scoped. Exercise the real
// portal with its supported explicit container, inside that query scope.
function TestPortal(props: Props) {
  const [container, setContainer] = createSignal<HTMLDivElement | null>(null);
  return <div ref={setContainer}><Select.Portal {...props} container={container} /></div>;
}
const ordinary = [
  ['Label', Select.Label, HTMLDivElement], ['Trigger', Select.Trigger, HTMLButtonElement],
  ['Value', Select.Value, HTMLSpanElement], ['Icon', Select.Icon, HTMLSpanElement],
  ['Backdrop', Select.Backdrop, HTMLDivElement], ['Group', Select.Group, HTMLDivElement],
] as const;
for (const [name, Part, Element] of ordinary) {
  describe(`Select.${name}`, () => describeConformance((props: Props) => <Select.Root open><Part {...props} /></Select.Root>, {
    initialProps: {}, refInstanceof: Element, ...(name === 'Trigger' ? { button: true, testRenderPropWith: 'button' as const } : {}),
  }));
}
describe('Select.Portal', () => describeConformance((props: Props) => <Select.Root open><TestPortal {...props} /></Select.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
describe('Select.Positioner', () => describeConformance((props: Props) => <Select.Root open><TestPortal><Select.Positioner {...props} alignItemWithTrigger={false} /></TestPortal></Select.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
for (const [name, Part] of [['Popup', Select.Popup], ['List', Select.List], ['Arrow', Select.Arrow], ['ScrollUpArrow', Select.ScrollUpArrow], ['ScrollDownArrow', Select.ScrollDownArrow]] as const) {
  describe(`Select.${name}`, () => describeConformance((props: Props) => <Select.Root open><TestPortal><Select.Positioner alignItemWithTrigger={false}><Part {...props} {...(name.startsWith('Scroll') ? { keepMounted: true } : {})} /></Select.Positioner></TestPortal></Select.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
}
describe('Select.Item', () => describeConformance((props: Props) => <Select.Root open><TestPortal><Select.Positioner alignItemWithTrigger={false}><Select.Popup><Select.Item {...props} /></Select.Popup></Select.Positioner></TestPortal></Select.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
describe('Select.ItemText', () => describeConformance((props: Props) => <Select.Root open><TestPortal><Select.Positioner alignItemWithTrigger={false}><Select.Popup><Select.Item><Select.ItemText {...props} /></Select.Item></Select.Popup></Select.Positioner></TestPortal></Select.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
describe('Select.ItemIndicator', () => describeConformance((props: Props) => <Select.Root open defaultValue="a"><TestPortal><Select.Positioner alignItemWithTrigger={false}><Select.Popup><Select.Item value="a"><Select.ItemIndicator {...props} keepMounted /></Select.Item></Select.Popup></Select.Positioner></TestPortal></Select.Root>, { initialProps: {}, refInstanceof: HTMLSpanElement }));
describe('Select.GroupLabel', () => describeConformance((props: Props) => <Select.Group><Select.GroupLabel {...props} /></Select.Group>, { initialProps: {}, refInstanceof: HTMLDivElement }));
describe('Select.Separator', () => describeConformance((props: Props) => <Select.Separator {...props} />, { initialProps: {}, refInstanceof: HTMLDivElement }));

describe('Select part ownership', () => {
  const { render, renderProps } = createRenderer();
  it('group label IDs remain reactive, hidden by default, and stale cleanup cannot erase a replacement', async () => {
    const view = await renderProps((props: { old: boolean; id: string }) => <Select.Group data-testid="group">
      {props.old ? <Select.GroupLabel id="old">Old</Select.GroupLabel> : null}
      <Select.GroupLabel id={props.id}>New</Select.GroupLabel>
    </Select.Group>, { old: true, id: 'new' });
    expect(screen.getByTestId('group')).toHaveAttribute('aria-labelledby', 'new');
    expect(screen.getByText('New')).toHaveAttribute('aria-hidden', 'true');
    await view.setProps({ old: false });
    expect(screen.getByTestId('group')).toHaveAttribute('aria-labelledby', 'new');
    await view.setProps({ id: 'replacement' });
    expect(screen.getByTestId('group')).toHaveAttribute('aria-labelledby', 'replacement');
  });
  it('Separator has source presentation semantics and reactive orientation', async () => {
    const view = await renderProps((props: { orientation: 'horizontal' | 'vertical' }) => <Select.Separator {...props} />, { orientation: 'horizontal' });
    const node = screen.getByRole('presentation');
    await view.setProps({ orientation: 'vertical' });
    expect(screen.getByRole('presentation')).toBe(node);
    expect(node).toHaveAttribute('data-orientation', 'vertical');
  });
  it('renders a visible group label and associates its actual id with the group', async () => {
    await render(() => <Select.Root open><Select.Positioner>
      <Select.Group><Select.GroupLabel>Fruits</Select.GroupLabel>
        <Select.Item value="apple">Apple</Select.Item><Select.Item value="banana">Banana</Select.Item>
      </Select.Group>
    </Select.Positioner></Select.Root>);
    const label = screen.getByText('Fruits');
    expect(label).toBeVisible();
    expect(screen.getByRole('group')).toHaveAttribute('aria-labelledby', label.id);
  });
  it('allows an explicitly undefined aria-hidden override on the group label', async () => {
    await render(() => <Select.Root open><Select.Group>
      <Select.GroupLabel aria-hidden={undefined}>Fruits</Select.GroupLabel>
    </Select.Group></Select.Root>);
    expect(screen.getByText('Fruits')).not.toHaveAttribute('aria-hidden');
  });
  it('unregisters the only group label when it is removed', async () => {
    const view = await renderProps((props: { mounted: boolean }) => <Select.Root open><Select.Group>
      {props.mounted ? <Select.GroupLabel id="group-label">Fruits</Select.GroupLabel> : null}
    </Select.Group></Select.Root>, { mounted: true });
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-labelledby', 'group-label');
    await view.setProps({ mounted: false });
    expect(screen.queryByText('Fruits')).toBeNull();
    expect(screen.getByRole('group')).toBe(group);
    expect(group).not.toHaveAttribute('aria-labelledby');
  });
  it('registers a newly inserted group label before removing the older label', async () => {
    const view = await renderProps((props: { labels: 'old' | 'both' | 'new' }) => <Select.Root open><Select.Group>
      {props.labels !== 'new' ? <Select.GroupLabel id="old-label">Old</Select.GroupLabel> : null}
      {props.labels !== 'old' ? <Select.GroupLabel id="new-label">New</Select.GroupLabel> : null}
    </Select.Group></Select.Root>, { labels: 'old' });
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-labelledby', 'old-label');
    await view.setProps({ labels: 'both' });
    expect(group).toHaveAttribute('aria-labelledby', 'new-label');
    await view.setProps({ labels: 'new' });
    expect(group).toHaveAttribute('aria-labelledby', 'new-label');
  });
  it('replaces and unregisters a conditional group label', async () => {
    const view = await renderProps((props: { id?: string }) => <Select.Root open><Select.Group>
      {props.id ? <Select.GroupLabel id={props.id}>{props.id}</Select.GroupLabel> : null}
    </Select.Group></Select.Root>, { id: 'first-label' });
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-labelledby', 'first-label');
    await view.setProps({ id: 'second-label' });
    expect(group).toHaveAttribute('aria-labelledby', 'second-label');
    await view.setProps({ id: undefined });
    expect(group).not.toHaveAttribute('aria-labelledby');
  });
  it('requires family/item/group providers rather than silently rendering orphaned parts', async () => {
    for (const Part of [Select.Trigger, Select.Value, Select.ItemText, Select.ItemIndicator, Select.GroupLabel] as (() => JSX.Element)[]) {
      await expect(render(() => <Part />)).rejects.toThrow();
    }
  });
});
