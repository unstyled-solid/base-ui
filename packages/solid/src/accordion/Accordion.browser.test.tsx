import { expect, vi } from 'vitest';
import { flush } from 'solid-js';
import { dynamic } from '@solidjs/web';
import { browserCase, createRenderer, fireEvent, waitFor } from '../../test';
import { Accordion } from './index';

const { render, renderProps } = createRenderer();
const source = 'packages/react/src/accordion/panel/AccordionPanel.test.tsx';

browserCase({ source, case: 'repeated item switches measure changed content and retain exit dimensions', environment: 'browser', issue: 'bsolid-docs-collapse-measurement' }, async () => {
  const view = await render(() => <>
    <style>{`
      .accordion-measured { overflow: hidden; height: var(--accordion-panel-height); transition: height 150ms linear; width: 120px; }
      .accordion-measured[data-starting-style], .accordion-measured[data-ending-style] { height: 0; }
    `}</style>
    <Accordion.Root keepMounted>
      <Accordion.Item value="a"><Accordion.Trigger>First</Accordion.Trigger>
        <Accordion.Panel class="accordion-measured" data-testid="first"><div data-testid="content" style={{ height: '80px' }}>First content</div></Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="b"><Accordion.Trigger>Second</Accordion.Trigger>
        <Accordion.Panel class="accordion-measured" data-testid="second"><div style={{ height: '60px' }}>Second content</div></Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  </>);
  const first = view.getByTestId('first');
  const second = view.getByTestId('second');
  for (const height of [80, 140, 100]) {
    view.getByTestId('content').style.height = `${height}px`;
    fireEvent.click(view.getByText('First')); flush();
    expect(first.style.getPropertyValue('--accordion-panel-height')).toBe(`${height}px`);
    expect(first.style.getPropertyValue('--accordion-panel-width')).toBe('120px');
    await waitFor(() => expect(first.style.getPropertyValue('--accordion-panel-height')).toBe('auto'));
    fireEvent.click(view.getByText('Second')); flush();
    expect(view.getByTestId('first')).toBe(first);
    expect(first).not.toHaveAttribute('hidden');
    expect(first.style.getPropertyValue('--accordion-panel-height')).toBe(`${height}px`);
    expect(first.style.getPropertyValue('--accordion-panel-width')).toBe('120px');
    await waitFor(() => expect(first).toHaveAttribute('hidden'));
    expect(first.style.getPropertyValue('--accordion-panel-height')).toBe('auto');
    await waitFor(() => expect(second.style.getPropertyValue('--accordion-panel-height')).toBe('auto'));
  }
});

browserCase({ source, case: 'keeps the closing panel visible until exit completes when switching items', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const view = await render(() => <>
    <style>{`
      .accordion-transition { overflow: hidden; height: var(--accordion-panel-height); transition: height 300ms linear; }
      .accordion-transition[data-starting-style], .accordion-transition[data-ending-style] { height: 0; }
    `}</style>
    <Accordion.Root defaultValue={['a']} keepMounted>
      <Accordion.Item value="a"><Accordion.Trigger>First</Accordion.Trigger>
        <Accordion.Panel class="accordion-transition" data-testid="first"><div style={{ height: '100px' }}>First content</div></Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="b"><Accordion.Trigger>Second</Accordion.Trigger>
        <Accordion.Panel class="accordion-transition" data-testid="second"><div style={{ height: '80px' }}>Second content</div></Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  </>);
  const first = view.getByTestId('first');
  const second = view.getByTestId('second');
  expect(first).toHaveAttribute('data-open');
  await waitFor(() => expect(first.style.getPropertyValue('--accordion-panel-height')).toBe('auto'));
  await view.user.click(view.getByText('Second'));
  await waitFor(() => expect(first).toHaveAttribute('data-ending-style'));
  expect(first).not.toHaveAttribute('hidden');
  expect(first.style.getPropertyValue('--accordion-panel-height')).toMatch(/px$/);
  expect(second).toHaveAttribute('data-open');
  await waitFor(() => expect(first).toHaveAttribute('hidden'));
  expect(second).not.toHaveAttribute('hidden');
});

const rootSource = 'packages/react/src/accordion/root/AccordionRoot.test.tsx';
const Span = dynamic(() => 'span', { static: true });

browserCase({ source: 'packages/react/src/accordion/item/AccordionItem.test.tsx', case: 'does not report hidden=true after the item has started opening', environment: 'browser', issue: 'bsolid-browser', adaptation: 'observe live Solid state in a tracked class callback rather than snapshotting render callback state' }, async () => {
  const seen: Array<{ open: boolean; hidden: boolean }> = [];
  const view = await render(() => <Accordion.Root><Accordion.Item class={(state) => {
    seen.push({ open: state.open, hidden: state.hidden });
    return state.open ? 'opened' : 'closed';
  }}><Accordion.Trigger>Trigger</Accordion.Trigger><Accordion.Panel>Panel</Accordion.Panel></Accordion.Item></Accordion.Root>);
  await view.user.click(view.getByText('Trigger'));
  expect(seen.some((state) => state.open && state.hidden)).toBe(false);
});

function Disclosure(props: { root?: Accordion.Root.Props; nativeButton?: boolean }) {
  return <Accordion.Root {...props.root}>
    <Accordion.Item value={0}><Accordion.Trigger nativeButton={props.nativeButton}
      render={props.nativeButton === false ? (host) => <Span {...host} /> : undefined}>First</Accordion.Trigger>
      <Accordion.Panel>First content</Accordion.Panel></Accordion.Item>
    <Accordion.Item value={1}><Accordion.Trigger>Second</Accordion.Trigger><Accordion.Panel>Second content</Accordion.Panel></Accordion.Item>
  </Accordion.Root>;
}

for (const controlled of [false, true]) {
  browserCase({ source: rootSource, case: `${controlled ? 'controlled' : 'uncontrolled'} / open state`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await renderProps<{ value: number[] }>((props) => <Disclosure root={controlled ? { value: props.value } : {}} />, { value: [] });
    const trigger = view.getByText('First');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(view.queryByText('First content')).toBeNull();
    if (controlled) await view.setProps({ value: [0] });
    else await view.user.pointer({ keys: '[MouseLeft]', target: trigger });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('data-panel-open');
    expect(view.getByText('First content')).toBeVisible();
    expect(view.getByText('First content')).toHaveAttribute('data-open');
    if (controlled) await view.setProps({ value: [] });
    else await view.user.pointer({ keys: '[MouseLeft]', target: trigger });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(view.queryByText('First content')).toBeNull();
  });
}

for (const nativeButton of [true, false]) {
  for (const key of ['Enter', 'Space']) {
    browserCase({ source: rootSource, case: `rendering ${nativeButton ? 'interactive' : 'non-interactive'} triggers / key: ${key} toggles the Accordion open state`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const view = await render(() => <Disclosure nativeButton={nativeButton} />);
      const trigger = view.getByText('First');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(view.queryByText('First content')).toBeNull();
      await view.user.tab();
      expect(trigger).toHaveFocus();
      await view.user.keyboard(`[${key}]`);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('data-panel-open');
      expect(view.getByText('First content')).toBeVisible();
      expect(view.getByText('First content')).toHaveAttribute('data-open');
      await view.user.keyboard(`[${key}]`);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(view.queryByText('First content')).toBeNull();
    });
  }
}

for (const multiple of [true, false]) {
  browserCase({ source: rootSource, case: multiple ? 'multiple items can be open when `multiple = true`' : 'when false only one item can be open', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <Disclosure root={{ multiple }} />);
    const [first, second] = view.getAllByRole('button');
    for (const trigger of [first, second]) expect(trigger).not.toHaveAttribute('data-panel-open');
    expect(view.queryByText('First content')).toBeNull();
    expect(view.queryByText('Second content')).toBeNull();
    await view.user.pointer({ keys: '[MouseLeft]', target: first });
    expect(first).toHaveAttribute('data-panel-open');
    expect(view.getByText('First content')).toHaveAttribute('data-open');
    await view.user.pointer({ keys: '[MouseLeft]', target: second });
    expect(second).toHaveAttribute('data-panel-open');
    expect(view.getByText('Second content')).toHaveAttribute('data-open');
    if (multiple) {
      expect(first).toHaveAttribute('data-panel-open');
      expect(view.getByText('First content')).toHaveAttribute('data-open');
      await view.user.pointer({ keys: '[MouseLeft]', target: first });
      expect(second).toHaveAttribute('data-panel-open');
      expect(view.getByText('Second content')).toHaveAttribute('data-open');
    }
    expect(first).not.toHaveAttribute('data-panel-open');
    expect(view.queryByText('First content')).toBeNull();
  });
}

for (const variant of ['numeric', 'custom', 'single'] as const) {
  browserCase({ source: rootSource, case: `prop: onValueChange / ${variant === 'numeric' ? 'default item value' : variant === 'custom' ? 'custom item value' : '`multiple` is false'}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const change = vi.fn();
    const values = variant === 'numeric' ? [0, 1] : ['one', 'two'];
    const view = await render(() => <Accordion.Root multiple={variant !== 'single'} onValueChange={change}>
      <Accordion.Item value={values[0]}><Accordion.Trigger>First</Accordion.Trigger><Accordion.Panel>1</Accordion.Panel></Accordion.Item>
      <Accordion.Item value={values[1]}><Accordion.Trigger>Second</Accordion.Trigger><Accordion.Panel>2</Accordion.Panel></Accordion.Item>
    </Accordion.Root>);
    const [first, second] = view.getAllByRole('button');
    expect(change).not.toHaveBeenCalled();
    await view.user.pointer({ keys: '[MouseLeft]', target: variant === 'custom' ? second : first });
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.lastCall?.[0]).toEqual([variant === 'custom' ? 'two' : values[0]]);
    if (variant === 'numeric') {
      expect(change.mock.lastCall?.[1].reason).toBe('trigger-press');
      expect(change.mock.lastCall?.[1].event.type).not.toBe('base-ui');
      second.focus();
      await view.user.keyboard('[Space]');
    } else await view.user.pointer({ keys: '[MouseLeft]', target: variant === 'custom' ? first : second });
    expect(change).toHaveBeenCalledTimes(2);
    expect(change.mock.lastCall?.[0]).toEqual(variant === 'numeric' ? [0, 1] : variant === 'custom' ? ['two', 'one'] : ['two']);
    if (variant === 'numeric') {
      expect(change.mock.lastCall?.[1].reason).toBe('trigger-press');
      expect(change.mock.lastCall?.[1].event.type).not.toBe('base-ui');
    }
  });
}

browserCase({ source, case: 'interrupted exit does not unmount a reopened panel', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const view = await render(() => <>
    <style>{`
      .accordion-interrupted { overflow: hidden; height: var(--accordion-panel-height); transition: height 300ms linear; }
      .accordion-interrupted[data-starting-style], .accordion-interrupted[data-ending-style] { height: 0; }
    `}</style>
    <Accordion.Root defaultValue={['a']}>
      <Accordion.Item value="a"><Accordion.Trigger>Toggle</Accordion.Trigger>
        <Accordion.Panel class="accordion-interrupted" data-testid="panel"><div style={{ height: '120px' }}>Content</div></Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  </>);
  const panel = view.getByTestId('panel');
  await view.user.click(view.getByText('Toggle'));
  await waitFor(() => expect(panel).toHaveAttribute('data-ending-style'));
  await view.user.click(view.getByText('Toggle'));
  await waitFor(() => expect(panel).toHaveAttribute('data-open'));
  await Promise.all(panel.getAnimations().map((animation) => animation.finished.catch(() => {})));
  expect(view.getByTestId('panel')).toBe(panel);
  expect(panel).not.toHaveAttribute('hidden');
});

browserCase({ source, case: 'hiddenUntilFound reveal bypasses motion and next close still animates', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const view = await render(() => <>
    <style>{`
      .accordion-search { overflow: hidden; height: var(--accordion-panel-height); transition: height 300ms linear; }
      .accordion-search[data-starting-style], .accordion-search[data-ending-style] { height: 0; }
    `}</style>
    <Accordion.Root hiddenUntilFound>
      <Accordion.Item><Accordion.Trigger>Toggle</Accordion.Trigger>
        <Accordion.Panel class="accordion-search" data-testid="panel"><div style={{ height: '100px' }}>Searchable content</div></Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  </>);
  const panel = view.getByTestId('panel');
  panel.dispatchEvent(new Event('beforematch'));
  panel.removeAttribute('hidden');
  await waitFor(() => expect(panel).toHaveAttribute('data-open'));
  expect(panel.getBoundingClientRect().height).toBeGreaterThan(0);
  await view.user.click(view.getByText('Toggle'));
  await waitFor(() => expect(panel).toHaveAttribute('data-ending-style'));
  expect(panel.style.transitionDuration).not.toBe('0s');
  expect(panel).not.toHaveAttribute('hidden');
  await waitFor(() => expect(panel).toHaveAttribute('hidden', 'until-found'));
});

// React.Activity has no Solid equivalent. This source case is adapted to preserving the
// same disclosure under a hidden ancestor, rather than emulating React effect lifetimes.
browserCase({ source, case: 'React.Activity / no replay when revealing a preserved open panel', environment: 'browser', issue: 'bsolid-browser', adaptation: 'a hidden ancestor preserves the native Solid owner and host' }, async () => {
  const view = await render(() => <>
    <style>{`@keyframes accordion-slide { from { height: 0; } to { height: var(--accordion-panel-height); } }`}</style>
    <div data-testid="ancestor"><Accordion.Root><Accordion.Item>
      <Accordion.Trigger>Toggle</Accordion.Trigger>
      <Accordion.Panel keepMounted data-testid="panel" style={{ 'animation-name': 'accordion-slide', 'animation-duration': '100ms' }}>
        <div style={{ height: '100px' }}>Content</div>
      </Accordion.Panel>
    </Accordion.Item></Accordion.Root></div>
  </>);
  await view.user.click(view.getByText('Toggle'));
  const panel = view.getByTestId('panel');
  await waitFor(() => expect(panel.getAnimations()).toHaveLength(0));
  const ancestor = view.getByTestId('ancestor');
  ancestor.style.visibility = 'hidden';
  ancestor.style.visibility = '';
  expect(panel).toHaveAttribute('data-open');
  expect(panel.getAnimations()).toHaveLength(0);
});
