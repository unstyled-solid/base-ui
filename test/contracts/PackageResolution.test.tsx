import { it, expect } from 'vitest';
import { Separator } from 'baseui-solid2/separator';
import { mergeProps } from 'baseui-solid2/merge-props';
import { useBaseUiId } from 'baseui-solid2/internals/useBaseUiId';
import { createRenderer } from '#test-utils';

it('resolves workspace package family exports and the test alias without a root barrel', async () => {
  const { render } = createRenderer();
  const view = await render(() => {
    const id = useBaseUiId('source-export-id');
    return <Separator id={id()} orientation="vertical" {...mergeProps({ title: 'default' }, { title: 'source-stage' })} />;
  });
  expect(view.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  expect(view.getByRole('separator')).toHaveAttribute('title', 'source-stage');
  expect(view.getByRole('separator')).toHaveAttribute('id', 'source-export-id');
});
