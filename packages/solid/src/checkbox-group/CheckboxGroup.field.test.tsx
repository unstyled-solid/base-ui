import { describe, expect, it, vi } from 'vitest';
import { createRenderer } from '../../test';
import { Checkbox } from '../checkbox';
import { CheckboxGroup } from './CheckboxGroup';
import { Field } from '../field';
import { Form } from '../form';
import { createRenderElement } from '../internals/createRenderElement';

// Public-wrapper replay of the pinned CheckboxGroup.test.tsx Field/Form outcomes.
// These assertions use the actual Field, Form and paired Checkbox components.
describe('CheckboxGroup public field integration', () => {
  const { render, renderProps } = createRenderer();

  it.each(['onChange', 'onBlur', 'onSubmit'] as const)('keeps required errors until every enabled checkbox is checked (%s)', async (validationMode) => {
    const submit = vi.fn();
    const view = await render(() => <Form onFormSubmit={submit}>
      <Field.Root name="protocols" validationMode={validationMode}>
        <CheckboxGroup>
          <Field.Item><Checkbox.Root value="http" aria-label="HTTP" required /></Field.Item>
          <Field.Item><Checkbox.Root value="https" aria-label="HTTPS" required /></Field.Item>
          <Field.Item><Checkbox.Root value="disabled" required disabled /></Field.Item>
        </CheckboxGroup>
        <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
      </Field.Root><button type="submit">Submit</button>
    </Form>);
    const http = view.getByRole('checkbox', { name: 'HTTP' });
    const https = view.getByRole('checkbox', { name: 'HTTPS' });
    expect(view.queryByTestId('error')).toBeNull();
    if (validationMode === 'onSubmit') await view.user.click(view.getByRole('button'));
    await view.user.click(https);
    if (validationMode === 'onBlur') await view.user.tab();
    if (validationMode === 'onSubmit') await view.user.click(view.getByRole('button'));
    expect(view.getByTestId('error')).toHaveTextContent('required');
    expect(http).toHaveAttribute('aria-invalid', 'true');
    await view.user.click(http);
    if (validationMode === 'onBlur') await view.user.tab();
    await view.user.click(view.getByRole('button'));
    expect(view.queryByTestId('error')).toBeNull();
    expect(submit.mock.lastCall?.[0]).toEqual({ protocols: ['https', 'http'] });
  });

  it('projects only successful inputs while validation retains logical selection through disable, reassociation and remount', async () => {
    const submit = vi.fn();
    const validate = vi.fn((_value: unknown, _values: Record<string, unknown>) => null);
    const view = await renderProps((props: { disabled: boolean; mounted: boolean; external: boolean }) => <>
      <form id="other-checkbox-form" />
      <Form onFormSubmit={submit}>
        <Field.Root name="fruits" validate={validate}>
          <CheckboxGroup defaultValue={['apple', 'banana', 'missing']} allValues={['apple', 'banana', 'missing']}>
            <Checkbox.Root parent data-testid="parent" />
            <Checkbox.Root value="apple" />
            {props.mounted && <Checkbox.Root value="banana" data-testid="banana" disabled={props.disabled} form={props.external ? 'other-checkbox-form' : undefined} />}
          </CheckboxGroup>
        </Field.Root><button type="submit">Submit</button>
      </Form>
    </>, { disabled: true, mounted: true, external: false });
    const banana = view.getByTestId('banana');
    await view.user.click(view.getByRole('button'));
    expect(validate.mock.lastCall).toEqual([['apple', 'banana', 'missing'], { fruits: ['apple'] }]);
    expect(submit.mock.lastCall?.[0]).toEqual({ fruits: ['apple'] });
    expect(view.getByTestId('parent').nextElementSibling).not.toHaveAttribute('name');
    await view.setProps({ disabled: false });
    expect(view.getByTestId('banana')).toBe(banana);
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ fruits: ['apple', 'banana'] });
    await view.setProps({ external: true });
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ fruits: ['apple'] });
    await view.setProps({ mounted: false, external: false });
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ fruits: ['apple'] });
    await view.setProps({ mounted: true });
    expect(view.getByTestId('banana')).toHaveAttribute('aria-checked', 'true');
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ fruits: ['apple', 'banana'] });
    expect(validate.mock.lastCall?.[0]).toEqual(['apple', 'banana', 'missing']);
  });

  it.each([false, true])('removes native constraints without discarding inputless custom validation (custom=%s)', async (custom) => {
    const submit = vi.fn();
    const validate = vi.fn(() => 'custom error');
    const view = await renderProps((props: { mounted: boolean }) => <Form onFormSubmit={submit}>
      <Field.Root name="choices" validate={custom ? validate : undefined}>
        <CheckboxGroup>{props.mounted && <Checkbox.Root value="a" required />}</CheckboxGroup>
        <Field.Error data-testid="error" />
      </Field.Root><button type="submit">Submit</button>
    </Form>, { mounted: true });
    await view.user.click(view.getByRole('button'));
    expect(submit).not.toHaveBeenCalled();
    await view.setProps({ mounted: false });
    validate.mockClear();
    await view.user.click(view.getByRole('button'));
    if (custom) {
      expect(validate).toHaveBeenCalledExactlyOnceWith([], { choices: [] });
      expect(view.getByTestId('error')).toHaveTextContent('custom error');
      expect(submit).not.toHaveBeenCalled();
    } else expect(submit.mock.lastCall?.[0]).toEqual({ choices: [] });
  });

  it.each([false, true])('labels the group, preserves distinct checkbox ids, and names exposed children (nativeButton=%s)', async (nativeButton) => {
    const host = nativeButton ? (props: Parameters<NonNullable<Checkbox.Root.Props['render']>>[0]) => createRenderElement('button', {}, { props }) : undefined;
    const view = await render(() => <Field.Root name="fruits">
      <Field.Label>Fruits</Field.Label>
      <CheckboxGroup allValues={['apple', 'banana']}>
        <Checkbox.Root parent data-testid="parent" nativeButton={nativeButton} render={host} />
        <Checkbox.Root value="apple" nativeButton={nativeButton} render={host} />
        <Checkbox.Root value="banana" nativeButton={nativeButton} render={host} />
      </CheckboxGroup>
    </Field.Root>);
    const label = view.getByText('Fruits');
    expect(label).not.toHaveAttribute('for');
    expect(view.getByRole('group')).toHaveAttribute('aria-labelledby', label.id);
    const ids = [...view.container.querySelectorAll('[id]')].map((node) => node.id);
    expect(ids).toHaveLength(nativeButton ? 4 : 7);
    expect(new Set(ids).size).toBe(ids.length);
    const controls = view.getAllByRole('checkbox');
    expect(view.getByTestId('parent')).toHaveAttribute('aria-controls', controls.slice(1).map((node) => node.id).join(' '));
  });
});
