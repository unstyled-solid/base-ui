import { describe, expect, it } from 'vitest';
import { createRenderer } from '../../../test';
import { Autocomplete } from '../index';
import type { AutocompleteValueProps } from './AutocompleteValue';

describe('Autocomplete.Value', () => {
  const { render, renderProps } = createRenderer();
  it.each(['hel', ''])('renders function children with the current input text %j', async (defaultValue) => {
    const view = await render(() => <Autocomplete.Root defaultValue={defaultValue}>
      <Autocomplete.Value>{(value) => <span>{value || 'empty'}</span>}</Autocomplete.Value>
    </Autocomplete.Root>);
    expect(view.getByText(defaultValue || 'empty')).toBeInTheDocument();
  });
  it('renders complex static JSX instead of the input value', async () => {
    const view = await render(() => <Autocomplete.Root defaultValue="ignored"><Autocomplete.Value>
      <span data-testid="complex"><strong>Bold</strong> and <em>italic</em></span>
    </Autocomplete.Value></Autocomplete.Root>);
    expect(view.getByTestId('complex').querySelector('strong')).toHaveTextContent('Bold');
    expect(view.getByTestId('complex').querySelector('em')).toHaveTextContent('italic');
  });
  it('keeps child callbacks live and falls back only for nullish children', async () => {
    const view = await renderProps<AutocompleteValueProps & { value: string }>((props) =>
      <Autocomplete.Root value={props.value}><span data-testid="value"><Autocomplete.Value>{props.children}</Autocomplete.Value></span></Autocomplete.Root>,
    { value: 'before', children: undefined });
    expect(view.getByTestId('value')).toHaveTextContent('before');
    await view.setProps({ value: 'after', children: (value) => `Current: ${value}` });
    expect(view.getByTestId('value')).toHaveTextContent('Current: after');
    await view.setProps({ children: 'Custom Display Text' });
    expect(view.getByTestId('value')).toHaveTextContent('Custom Display Text');
    await view.setProps({ children: '' });
    expect(view.getByTestId('value')).toBeEmptyDOMElement();
  });
});
