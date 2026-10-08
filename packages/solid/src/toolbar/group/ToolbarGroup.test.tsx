import { describe, expect, it } from 'vitest';
import { createRenderer, describeConformance } from '../../../test';
import type { ToolbarConformanceProps } from '../Toolbar.test-types';
import { Toolbar } from '../index';
import type { ToolbarGroupProps, ToolbarGroupState } from './ToolbarGroup';

describe('Toolbar.Group', () => {
  const { render, renderProps } = createRenderer();
  describeConformance<ToolbarGroupState, ToolbarConformanceProps<ToolbarGroupProps, ToolbarGroupState>>((props) => <Toolbar.Root><Toolbar.Group {...props} /></Toolbar.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
  it('disables controls except links, and restores them reactively', async () => {
    const view = await renderProps((props: { disabled: boolean }) => <Toolbar.Root><Toolbar.Group disabled={props.disabled} data-testid="group">
      <Toolbar.Button /><Toolbar.Input /><Toolbar.Link href="#">link</Toolbar.Link>
    </Toolbar.Group></Toolbar.Root>, { disabled: true });
    expect(view.getByRole('group')).toHaveAttribute('data-disabled');
    expect(view.getByTestId('group')).toBe(view.getByRole('group'));
    for (const node of [view.getByRole('button'), view.getByRole('textbox')]) {
      expect(node).toHaveAttribute('aria-disabled', 'true');
      expect(node).toHaveAttribute('data-disabled');
    }
    expect(view.getByRole('link')).not.toHaveAttribute('aria-disabled');
    expect(view.getByRole('link')).not.toHaveAttribute('data-disabled');
    const button = view.getByRole('button');
    await view.setProps({ disabled: false });
    expect(view.getByRole('button')).toBe(button);
    expect(button).not.toHaveAttribute('data-disabled');
  });
  it('uses the nearest group rather than inheriting an outer group disabled flag', async () => {
    const view = await render(() => <Toolbar.Root><Toolbar.Group disabled>
      <Toolbar.Button>outer</Toolbar.Button><Toolbar.Group><Toolbar.Button>inner</Toolbar.Button></Toolbar.Group>
    </Toolbar.Group></Toolbar.Root>);
    expect(view.getByRole('button', { name: 'outer' })).toHaveAttribute('data-disabled');
    expect(view.getByRole('button', { name: 'inner' })).not.toHaveAttribute('data-disabled');
  });
});
