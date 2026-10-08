import { describe, expect, it, vi } from 'vitest';
import { createRenderer, describeConformance } from '../../../test';
import { Collapsible } from '../index';

describe('Collapsible.Trigger', () => {
  const { render } = createRenderer();
  for (const testRenderPropWith of ['div', 'button'] as const) {
    describe(`conformance custom host ${testRenderPropWith}`, () => {
      describeConformance((props) => <Collapsible.Root><Collapsible.Trigger {...props} /></Collapsible.Root>, {
        initialProps: {}, refInstanceof: HTMLButtonElement, button: true, testRenderPropWith,
      });
    });
  }
  it('requires the disclosure provider', async () => {
    await render(() => {
      expect(() => Collapsible.Trigger({})).toThrow(/context/i);
      return <div />;
    });
  });
  for (const native of [true, false]) {
    it(`disables activation and tab order (native=${native})`, async () => {
      const change = vi.fn();
      const view = await render(() => <Collapsible.Root disabled onOpenChange={change}>
        <Collapsible.Trigger nativeButton={native} render={native ? undefined : (props) => <span {...props} />}>Toggle</Collapsible.Trigger>
      </Collapsible.Root>);
      const trigger = view.getByRole('button');
      expect(trigger).toHaveAttribute('data-disabled');
      if (native) {
        expect(trigger).toBeDisabled();
        expect(trigger).not.toHaveAttribute('aria-disabled');
      } else {
        expect(trigger).not.toHaveAttribute('disabled');
        expect(trigger).toHaveAttribute('aria-disabled', 'true');
        expect(trigger).toHaveAttribute('tabindex', '-1');
      }
      await view.user.click(trigger);
      await view.user.tab();
      expect(trigger).not.toHaveFocus();
      expect(change).not.toHaveBeenCalled();
      for (const key of ['Enter', 'Space']) {
        await view.user.keyboard(`[${key}]`);
        expect(change).not.toHaveBeenCalled();
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      }
    });
  }
  for (const key of ['{Enter}', ' ']) {
    it(`toggles with ${key}`, async () => {
      const view = await render(() => <Collapsible.Root>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger><Collapsible.Panel>Contents</Collapsible.Panel>
      </Collapsible.Root>);
      const trigger = view.getByRole('button');
      expect(trigger).not.toHaveAttribute('aria-controls');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(view.queryByText('Contents')).toBeNull();
      await view.user.tab();
      expect(trigger).toHaveFocus();
      await view.user.keyboard(key);
      expect(view.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('aria-controls', view.getByText('Contents').id);
      expect(trigger).toHaveAttribute('data-panel-open');
      expect(view.getByText('Contents')).toBeVisible();
      expect(view.getByText('Contents')).toHaveAttribute('data-open');
      await view.user.keyboard(key);
      expect(view.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).not.toHaveAttribute('aria-controls');
      expect(trigger).not.toHaveAttribute('data-panel-open');
      expect(view.queryByText('Contents')).toBeNull();
    });
  }
  it('keeps preventDefault independent from preventBaseUIHandler', async () => {
    const change = vi.fn();
    const view = await render(() => <Collapsible.Root onOpenChange={change}>
      <Collapsible.Trigger onClick={(event) => event.preventBaseUIHandler()}>Cancel handler</Collapsible.Trigger>
      <Collapsible.Trigger onClick={(event) => event.preventDefault()}>Cancel default</Collapsible.Trigger>
    </Collapsible.Root>);
    await view.user.click(view.getByRole('button', { name: 'Cancel handler' }));
    expect(change).not.toHaveBeenCalled();
    await view.user.click(view.getByRole('button', { name: 'Cancel default' }));
    expect(change).toHaveBeenCalledOnce();
  });
  it('forwards the id prop', async () => {
    const view = await render(() => <Collapsible.Root><Collapsible.Trigger id="custom-trigger-id">Trigger</Collapsible.Trigger></Collapsible.Root>);
    expect(view.getByRole('button')).toHaveAttribute('id', 'custom-trigger-id');
  });
  it('runs the current consumer handler before the cancelable disclosure request', async () => {
    const order: string[] = [];
    const view = await render(() => <Collapsible.Root onOpenChange={(_, details) => {
      order.push('request');
      expect(details.event.defaultPrevented).toBe(true);
      details.cancel();
    }}>
      <Collapsible.Trigger onClick={(event) => { order.push('consumer'); event.preventDefault(); }}>Toggle</Collapsible.Trigger>
      <Collapsible.Panel>Contents</Collapsible.Panel>
    </Collapsible.Root>);
    await view.user.click(view.getByRole('button'));
    expect(order).toEqual(['consumer', 'request']);
    expect(view.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    expect(view.queryByText('Contents')).toBeNull();
  });
  it('allows a trigger disabled override without changing the root-derived public state', async () => {
    const view = await render(() => <Collapsible.Root disabled>
      <Collapsible.Trigger disabled={false}>Toggle</Collapsible.Trigger><Collapsible.Panel>Contents</Collapsible.Panel>
    </Collapsible.Root>);
    const trigger = view.getByRole('button');
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveAttribute('data-disabled');
    await view.user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
  for (const key of ['{Enter}', ' ']) {
    it(`toggles a non-native trigger with ${key}`, async () => {
      const view = await render(() => <Collapsible.Root>
        <Collapsible.Trigger nativeButton={false} render={(props) => <span {...props} />}>Toggle</Collapsible.Trigger>
        <Collapsible.Panel>Contents</Collapsible.Panel>
      </Collapsible.Root>);
      const trigger = view.getByRole('button');
      await view.user.tab();
      expect(trigger).toHaveFocus();
      await view.user.keyboard(key);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await view.user.keyboard(key);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  }
});
