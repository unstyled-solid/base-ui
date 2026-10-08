import { describe, expect, it } from 'vitest';
import { createRenderer } from '../../../test';
import { ToolbarRootContext, useToolbarRootContext } from './ToolbarRootContext';
import { ToolbarGroupContext, useToolbarGroupContext } from '../group/ToolbarGroupContext';
import { Toolbar } from '../index';
import { CompositeRoot } from '../../internals/composite';

describe('ToolbarRootContext host seam', () => {
  const { render, renderProps } = createRenderer();
  it('has explicit null optional contexts and descriptive required access', async () => {
    await render(() => {
      expect(useToolbarRootContext(true)).toBeNull();
      expect(useToolbarGroupContext()).toBeNull();
      expect(() => useToolbarRootContext()).toThrow('Base UI: ToolbarRootContext is missing. Toolbar parts must be placed within <Toolbar.Root>.');
      return <span>outside</span>;
    });
  });
  it('shares live host values with optional and required consumers', async () => {
    function Consumer() {
      const optional = useToolbarRootContext(true);
      const required = useToolbarRootContext();
      const group = useToolbarGroupContext();
      expect(optional).toBe(required);
      return <span data-testid="context" data-disabled={String(required.disabled)} data-group-disabled={String(group?.disabled)}>{required.orientation}</span>;
    }
    const view = await renderProps((props: { disabled: boolean; orientation: 'horizontal' | 'vertical' }) => {
      const host: ToolbarRootContext = {
        get disabled() { return props.disabled; },
        get orientation() { return props.orientation; },
      };
      const group: ToolbarGroupContext = { get disabled() { return props.disabled; } };
      return <ToolbarRootContext value={host}>
        <ToolbarGroupContext value={group}><Consumer /></ToolbarGroupContext>
      </ToolbarRootContext>;
    }, { disabled: false, orientation: 'horizontal' });
    const node = view.getByTestId('context');
    expect(node).toHaveTextContent('horizontal');
    await view.setProps({ disabled: true, orientation: 'vertical' });
    expect(view.getByTestId('context')).toBe(node);
    expect(node).toHaveTextContent('vertical');
    expect(node).toHaveAttribute('data-disabled', 'true');
    expect(node).toHaveAttribute('data-group-disabled', 'true');
  });
  it('supports every source part with one source-shaped host provider', async () => {
    const view = await renderProps((props: { disabled: boolean; orientation: 'horizontal' | 'vertical' }) => {
      const host: ToolbarRootContext = {
        get disabled() { return props.disabled; },
        get orientation() { return props.orientation; },
      };
      return <ToolbarRootContext value={host}><CompositeRoot orientation={props.orientation}>
        <Toolbar.Group><Toolbar.Button>button</Toolbar.Button><Toolbar.Input />
          <Toolbar.Link href="#">link</Toolbar.Link><Toolbar.Separator />
        </Toolbar.Group>
      </CompositeRoot></ToolbarRootContext>;
    }, { disabled: false, orientation: 'horizontal' });
    const button = view.getByRole('button');
    expect(button).not.toHaveAttribute('data-disabled');
    expect(view.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    await view.setProps({ disabled: true, orientation: 'vertical' });
    expect(view.getByRole('button')).toBe(button);
    for (const node of [button, view.getByRole('textbox')]) {
      expect(node).toHaveAttribute('aria-disabled', 'true');
      expect(node).toHaveAttribute('data-orientation', 'vertical');
    }
    expect(view.getByRole('group')).toHaveAttribute('data-disabled');
    expect(view.getByRole('link')).not.toHaveAttribute('aria-disabled');
    expect(view.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });
});
