// Native DOM projections from the pinned React Input/FieldControl, SwitchRoot,
// RadioRoot/RadioGroup implementations at 19511bb171f3b360b006c94cf6d07e53cb446505.
import { describe, expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { Field } from './index';
import { Fieldset } from '../fieldset';
import { Form } from '../form';
import { Input } from '../input';
import { Switch } from '../switch';
import { Radio } from '../radio';
import { RadioGroup } from '../radio-group';

describe('Field real native-control SSR projections', () => {
  it('serializes the Input facade value and Field-name precedence without a missing label', () => {
    const html = renderToString(() => <Field.Root name="amount">
      <Input name="ignored" type="number" value={5} />
    </Field.Root>);
    expect(html).toContain('value="5"');
    expect(html).toContain('name="amount"');
    expect(html).not.toContain('name="ignored"');
    expect(html).not.toContain('aria-labelledby');
  });

  it('renders the direct Switch checkbox with checked state and the source native form value', () => {
    const html = renderToString(() => <Form id="settings"><Field.Root name="enabled">
      <Switch.Root defaultChecked required value="yes" uncheckedValue="no" />
    </Field.Root></Form>);
    const inputs = html.match(/<input\b[^>]*>/g) ?? [];
    expect(inputs).toHaveLength(1);
    expect(inputs[0]).toContain('type="checkbox"');
    expect(inputs[0]).toContain('name="enabled"');
    expect(inputs[0]).toContain('value="yes"');
    expect(inputs[0]).toMatch(/\bchecked(?:[\s=>])/);
    expect(inputs[0]).toMatch(/\brequired(?:[\s=>])/);
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-checked="true"');
    expect(html).not.toContain('aria-invalid');
  });

  it('renders every lazy RadioGroup descendant with selected state, Field name and disabled ancestry', () => {
    const html = renderToString(() => <Fieldset.Root disabled><Field.Root name="choice">
      <RadioGroup name="ignored" defaultValue="a" required>
        <Field.Item><Radio.Root value="a" /></Field.Item><Radio.Root value="b" />
      </RadioGroup>
    </Field.Root></Fieldset.Root>);
    const inputs = html.match(/<input\b[^>]*>/g) ?? [];
    expect(inputs).toHaveLength(2);
    for (const input of inputs) {
      expect(input).toContain('type="radio"');
      expect(input).toContain('name="choice"');
      expect(input).toMatch(/\bdisabled(?:[\s=>])/);
      expect(input).toMatch(/\brequired(?:[\s=>])/);
    }
    expect(inputs[0]).toContain('value="a"');
    expect(inputs[0]).toMatch(/\bchecked(?:[\s=>])/);
    expect(inputs[1]).toContain('value="b"');
    expect(inputs[1]).not.toMatch(/\bchecked(?:[\s=>])/);
    expect(html).toContain('role="radiogroup"');
    expect(html).not.toContain('name="ignored"');
  });
});
