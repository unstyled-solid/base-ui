import { describe, expect, it } from 'vitest';
import { createRenderer, expectDiagnostic } from '../../../test';
import { Field } from '../index';

const { render } = createRenderer();
describe('Field.Label diagnostics', () => {
  it('reports a native label rendered as a div exactly once', async () => {
    await expectDiagnostic({ message: /Base UI: <Field.Label> expected a <label> element/, count: 1 }, async () => {
      await render(() => <Field.Root><Field.Label<HTMLDivElement> render={(p) => <div {...p} />}>Label</Field.Label></Field.Root>);
    });
  });

  it('reports a non-native label rendered as a label exactly once', async () => {
    await expectDiagnostic({ message: /Base UI: <Field.Label> expected a non-<label> element/, count: 1 }, async () => {
      await render(() => <Field.Root><Field.Label nativeLabel={false}>Label</Field.Label></Field.Root>);
    });
  });

  it('does not report mismatches when the render callback returns no host', async () => {
    const view = await render(() => <Field.Root><Field.Label render={() => null}>Label</Field.Label></Field.Root>);
    expect(view.queryByText('Label')).toBeNull();
  });
});
