import { createContext, useContext, type Setter } from 'solid-js';

export interface FieldsetRootContext {
  readonly legendId: string | undefined;
  readonly disabled: boolean;
  setLegendId: Setter<string | undefined>;
}

export const FieldsetRootContext = createContext<FieldsetRootContext | null>(null);

export function useFieldsetRootContext(optional: true): FieldsetRootContext | null;
export function useFieldsetRootContext(optional?: false): FieldsetRootContext;
export function useFieldsetRootContext(optional = false) {
  const context = useContext(FieldsetRootContext);
  if (context === null && !optional) {
    throw new Error(
      'Base UI: FieldsetRootContext is missing. Fieldset parts must be placed within <Fieldset.Root>.',
    );
  }
  return context;
}
