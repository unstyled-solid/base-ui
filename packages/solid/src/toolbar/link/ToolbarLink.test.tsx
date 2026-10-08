import { describe, expect, it } from 'vitest';
import { createRenderer, describeConformance } from '../../../test';
import type { ToolbarConformanceProps } from '../Toolbar.test-types';
import { Toolbar } from '../index';
import type { ToolbarLinkProps, ToolbarLinkState } from './ToolbarLink';

describe('Toolbar.Link', () => {
  const { render } = createRenderer();
  describeConformance<ToolbarLinkState, ToolbarConformanceProps<ToolbarLinkProps, ToolbarLinkState>>((props) => <Toolbar.Root><Toolbar.Link {...props} /></Toolbar.Root>, {
    initialProps: {}, refInstanceof: HTMLAnchorElement, testRenderPropWith: 'a',
  });
  it('renders an anchor with native link props', async () => {
    const view = await render(() => <Toolbar.Root disabled><Toolbar.Link data-testid="link" href="#target" target="_blank" rel="noreferrer">link</Toolbar.Link></Toolbar.Root>);
    expect(view.getByTestId('link')).toBe(view.getByRole('link'));
    expect(view.getByRole('link')).toHaveAttribute('href', '#target');
    expect(view.getByRole('link')).toHaveAttribute('target', '_blank');
    expect(view.getByRole('link')).not.toHaveAttribute('aria-disabled');
  });
});
