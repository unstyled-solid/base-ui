import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { Autocomplete } from '../index';

export type FixtureProps = Omit<Autocomplete.Root.Props<string>, 'items'> & {
  items?: readonly string[];
  inputInside?: boolean;
  keepMounted?: boolean;
  itemClick?: Autocomplete.Item.Props['onClick'];
  listStyle?: JSX.CSSProperties;
};

/** Real shared parts; no mocked Combobox implementation. */
export function AutocompleteFixture(props: FixtureProps) {
  const root = omit(props, 'inputInside', 'keepMounted', 'itemClick', 'listStyle');
  return <Autocomplete.Root items={['alpha', 'alpine', 'beta']} {...root}>
    <Autocomplete.InputGroup data-testid="group">
      {!props.inputInside && <Autocomplete.Input data-testid="input" />}
      <Autocomplete.Trigger data-testid="trigger"><Autocomplete.Value /></Autocomplete.Trigger>
      <Autocomplete.Clear data-testid="clear">Clear</Autocomplete.Clear>
    </Autocomplete.InputGroup>
    {props.inline ? <Autocomplete.List style={props.listStyle}>
      {(item: string) => <Autocomplete.Item value={item} onClick={props.itemClick}>{item}</Autocomplete.Item>}
    </Autocomplete.List> : <Autocomplete.Portal keepMounted={props.keepMounted}>
      <Autocomplete.Positioner>
        <Autocomplete.Popup aria-label={props.inputInside ? 'Commands' : undefined}>
          {props.inputInside && <Autocomplete.Input data-testid="input" />}
          <Autocomplete.List style={props.listStyle}>
            {(item: string) => <Autocomplete.Item value={item} onClick={props.itemClick}>{item}</Autocomplete.Item>}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Positioner>
    </Autocomplete.Portal>}
  </Autocomplete.Root>;
}
