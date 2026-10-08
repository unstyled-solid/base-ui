import type { FilterDropdownRootChangeEventDetails } from '../../filter-dropdown/root/FilterDropdownRootContext';
export interface MenuFilterProviderOptions {
  filter?: ((text: string, query: string) => boolean) | null;
  autoHighlight?: boolean | 'always';
  locale?: Intl.LocalesArgument;
  defaultValue?: string;
  value?: string;
  onValueChange?(value: string, details: FilterDropdownRootChangeEventDetails): void;
}
